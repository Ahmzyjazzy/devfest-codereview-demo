import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("leads.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'New',
    value REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    meeting_date DATETIME NOT NULL,
    notes TEXT,
    is_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS lead_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
  )
`);

const { count } = db.prepare("SELECT COUNT(*) AS count FROM leads").get();

if (count > 0) {
  console.log(`leads.db already has ${count} leads, skipping seed`);
} else {
  db.exec(fs.readFileSync("seed-data.sql", "utf8"));
  const total = db.prepare("SELECT COUNT(*) AS count FROM leads").get().count;
  console.log(`Seeded leads.db with ${total} leads`);
}

db.close();
