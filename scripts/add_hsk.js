const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');


const filePath = process.argv[2];
if (!filePath) {
    process.exit(1);
}

const dbPath = path.join(process.cwd(), 'hanzi.db');
const db = new Database(dbPath);

let data;
try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
} catch (e) {
    process.exit(1);
}

if (!Array.isArray(data)) {
    process.exit(1);
}

const insertItem = db.prepare(`
  INSERT OR REPLACE INTO items (id, type, level, char, pinyin, tone, meaning, mnemonic, components, example)
  VALUES (@id, @type, @level, @char, @pinyin, @tone, @meaning, @mnemonic, @components, @example)
`);

const insertAssign = db.prepare(`
  INSERT OR IGNORE INTO assignments (item_id, srs_stage, unlocked)
  VALUES (@item_id, 0, 0)
`);


const transaction = db.transaction((items) => {
  for (const item of items) {
    insertItem.run({
      id: item.id,
      type: item.type,
      level: item.level,
      char: item.char,
      pinyin: item.pinyin || null,
      tone: JSON.stringify(item.tone || null),
      meaning: JSON.stringify(item.meaning || []),
      mnemonic: item.mnemonic || null,
      components: JSON.stringify(item.components || []),
      example: item.example || null
    });
    insertAssign.run({ item_id: item.id });
  }
});

try {
    transaction(data);
    console.log("done");

} catch (e) {
}
