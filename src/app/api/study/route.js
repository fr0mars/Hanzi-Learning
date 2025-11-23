import { NextResponse } from 'next/server';
import { getDb, parseItem } from '@/lib/db';
import { calculateNextReview } from '@/lib/srs';

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const level = searchParams.get('level');

  const user = db.prepare('SELECT * FROM users WHERE id = 1').get();

  if (action === 'dashboard') {
    const lessonsResult = db.prepare(`SELECT COUNT(*) as count FROM items i JOIN assignments a ON i.id = a.item_id WHERE a.unlocked = 1 AND a.srs_stage = 0`).get();
    const reviewsResult = db.prepare(`SELECT COUNT(*) as count FROM assignments WHERE srs_stage > 0 AND srs_stage < 9 AND next_review <= datetime('now')`).get();

    const lessonsCount = lessonsResult ? lessonsResult.count : 0;
    const reviewsCount = reviewsResult ? reviewsResult.count : 0;

    const hskStats = {};
    let previousLevelCompleted = true;

    for (let lvl = 1; lvl <= 6; lvl++) {
      const total = db.prepare(`SELECT COUNT(*) as count FROM items WHERE level = ?`).get(lvl).count;
      const learned = db.prepare(`SELECT COUNT(*) as count FROM items i JOIN assignments a ON i.id = a.item_id WHERE i.level = ? AND a.srs_stage > 0`).get(lvl).count;

      const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

      const isLocked = !previousLevelCompleted;

      hskStats[lvl] = {
        total,
        learned,
        percent,
        locked: isLocked
      };

      previousLevelCompleted = percent >= 80 || total === 0;
    }

    const openLevels = Object.keys(hskStats).filter(lvl => !hskStats[lvl].locked).map(Number);

    const potentialUnlocks = db.prepare(`
        SELECT i.* FROM items i 
        JOIN assignments a ON i.id = a.item_id 
        WHERE a.unlocked = 0 AND i.level IN (${openLevels.join(',')})
    `).all();

    let newUnlocks = 0;
    for (const item of potentialUnlocks) {
      const parsed = parseItem(item);
      let canUnlock = false;

      if ((!parsed.components || parsed.components.length === 0)) {
        canUnlock = true;
      }
      else if (parsed.components.length > 0) {
        const placeholders = parsed.components.map(() => '?').join(',');
        const parents = db.prepare(`SELECT srs_stage FROM assignments WHERE item_id IN (${placeholders})`).all(...parsed.components);
        if (parents.length === parsed.components.length && parents.every(p => p.srs_stage >= 5)) {
          canUnlock = true;
        }
      }

      if (canUnlock) {
        db.prepare('UPDATE assignments SET unlocked = 1 WHERE item_id = ?').run(item.id);
        newUnlocks++;
      }
    }

    return NextResponse.json({ user, lessonsCount: lessonsCount + newUnlocks, reviewsCount, hskStats });
  }

  if (action === 'level_items' && level) {
    const items = db.prepare(`
        SELECT i.*, a.srs_stage, a.unlocked, a.next_review 
        FROM items i 
        JOIN assignments a ON i.id = a.item_id 
        WHERE i.level = ?
      `).all(level);
    return NextResponse.json(items.map(parseItem));
  }

  if (action === 'lessons') {
    const items = db.prepare(`
        SELECT i.*, a.srs_stage 
        FROM items i 
        JOIN assignments a ON i.id = a.item_id 
        WHERE a.unlocked = 1 AND a.srs_stage = 0 
        ORDER BY CASE WHEN i.faction = ? THEN 0 ELSE 1 END, RANDOM() 
        LIMIT 5
    `).all(user.faction);
    return NextResponse.json(items.map(parseItem));
  }

  if (action === 'reviews') {
    const items = db.prepare(`
        SELECT i.*, a.srs_stage 
        FROM items i 
        JOIN assignments a ON i.id = a.item_id 
        WHERE a.srs_stage > 0 AND a.srs_stage < 9 AND a.next_review <= datetime('now') 
        ORDER BY RANDOM() 
        LIMIT 50
    `).all();
    return NextResponse.json(items.map(parseItem));
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);

  if (searchParams.get('action') === 'reset') {
    db.prepare('UPDATE assignments SET srs_stage = 0, unlocked = 0, next_review = NULL').run();
    const radicals = db.prepare("SELECT id FROM items WHERE components = '[]' OR components IS NULL").all();
    const resetStmt = db.prepare('UPDATE assignments SET unlocked = 1 WHERE item_id = ?');
    radicals.forEach(r => resetStmt.run(r.id));
    return NextResponse.json({ success: true });
  }

  if (searchParams.get('action') === 'set_faction') {
    const body = await request.json();
    const { faction } = body;
    db.prepare('UPDATE users SET faction = ? WHERE id = 1').run(faction);
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const { itemId, success, isPractice } = body;

  if (isPractice) {
    return NextResponse.json({ success: true, practice: true });
  }

  const assignment = db.prepare('SELECT srs_stage FROM assignments WHERE item_id = ?').get(itemId);
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let newStage = assignment.srs_stage;
  if (success) {
    newStage = Math.min(newStage + 1, 9);
  } else {
    newStage = Math.max(newStage - (newStage >= 5 ? 2 : 1), 1);
  }

  let nextReview;
  if (assignment.srs_stage === 0 && newStage === 1) {
    nextReview = '1970-01-01T00:00:00.000Z';
  } else {
    nextReview = calculateNextReview(newStage);
  }

  db.prepare(`UPDATE assignments SET srs_stage = ?, next_review = ? WHERE item_id = ?`).run(newStage, nextReview, itemId);
  return NextResponse.json({ newStage, nextReview });
}
