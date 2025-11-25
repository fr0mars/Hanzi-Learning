import { NextResponse } from 'next/server';
import { getDb, parseItem } from '@/lib/db';
import { calculateNextReview } from '@/lib/srs';
import fs from 'fs';
import path from 'path';

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

  if (action === 'learned_items') {
    const items = db.prepare(`
        SELECT i.*, a.srs_stage, a.unlocked, a.next_review 
        FROM items i 
        JOIN assignments a ON i.id = a.item_id 
        WHERE a.srs_stage > 0
        ORDER BY i.level ASC, a.srs_stage DESC
    `).all();
    return NextResponse.json(items.map(parseItem));
  }

  if (action === 'texts') {
    try {
      const textsDir = path.join(process.cwd(), 'src/data/texts');
      if (!fs.existsSync(textsDir)) {
        return NextResponse.json([]);
      }
      const files = fs.readdirSync(textsDir);
      const texts = files.map(file => {
        const content = fs.readFileSync(path.join(textsDir, file), 'utf-8');
        const json = JSON.parse(content);
        return json.map(t => ({
          id: t.id,
          title: t.title,
          level: t.level,
          description: t.description
        }));
      }).flat();

      return NextResponse.json(texts);
    } catch (error) {
      console.error('Error reading texts:', error);
      return NextResponse.json({ error: 'Failed to load texts' }, { status: 500 });
    }
  }

  if (action === 'text') {
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing text ID' }, { status: 400 });

    try {
      const textsDir = path.join(process.cwd(), 'src/data/texts');
      const files = fs.readdirSync(textsDir);
      let foundText = null;

      for (const file of files) {
        const content = fs.readFileSync(path.join(textsDir, file), 'utf-8');
        const json = JSON.parse(content);
        const text = json.find(t => t.id === id);
        if (text) {
          foundText = text;
          break;
        }
      }

      if (foundText) {
        return NextResponse.json(foundText);
      } else {
        return NextResponse.json({ error: 'Text not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error reading text:', error);
      return NextResponse.json({ error: 'Failed to load text' }, { status: 500 });
    }
  }

  if (action === 'chars_details') {
    const charsParam = searchParams.get('chars');
    if (!charsParam) return NextResponse.json({});

    const chars = charsParam.split(',');
    if (chars.length === 0) return NextResponse.json({});

    const placeholders = chars.map(() => '?').join(',');
    const items = db.prepare(`SELECT * FROM items WHERE char IN (${placeholders})`).all(...chars);

    const details = {};
    items.forEach(item => {
      const parsed = parseItem(item);
      details[item.char] = parsed;
    });

    return NextResponse.json(details);
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
