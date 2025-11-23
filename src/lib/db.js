import Database from 'better-sqlite3';
import path from 'path';

let db;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'hanzi.db');
    db = new Database(dbPath);
  }
  return db;
}

export function parseItem(item) {
  return {
    ...item,
    meaning: JSON.parse(item.meaning),
    components: JSON.parse(item.components),
    tone: JSON.parse(item.tone),
    assignment: item.srs_stage !== undefined ? {
      srs_stage: item.srs_stage,
      unlocked: !!item.unlocked,
      next_review: item.next_review
    } : undefined
  };
}
