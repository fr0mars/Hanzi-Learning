const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'hanzi.db');

if (fs.existsSync(dbPath)) {
  try { fs.unlinkSync(dbPath); } catch (e) { console.log("Impossible de supprimer l'ancienne DB"); }
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, 
    username TEXT DEFAULT 'Disciple', 
    level INTEGER DEFAULT 1, 
    sect TEXT, 
    exp INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, 
    type TEXT NOT NULL, 
    level INTEGER NOT NULL, 
    char TEXT NOT NULL, 
    pinyin TEXT, 
    tone TEXT, 
    meaning TEXT NOT NULL, 
    mnemonic TEXT, 
    components TEXT, 
    example TEXT
  );

  CREATE TABLE IF NOT EXISTS assignments (
    item_id TEXT PRIMARY KEY, 
    srs_stage INTEGER DEFAULT 0, 
    unlocked BOOLEAN DEFAULT 0, 
    next_review DATETIME, 
    started_at DATETIME,
    FOREIGN KEY(item_id) REFERENCES items(id)
  );
`);

const insertUser = db.prepare(`INSERT OR IGNORE INTO users (id, username, level) VALUES (1, 'Disciple', 1)`);
insertUser.run();

console.log('DB OK');
