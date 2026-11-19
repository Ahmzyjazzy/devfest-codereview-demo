import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("leads.db");

// Initialize database
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes - Leads
  app.get("/api/leads", (req, res) => {
    try {
      const leads = db.prepare("SELECT * FROM leads ORDER BY updated_at DESC").all();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", (req, res) => {
    const { name, company, email, phone, status, value, notes } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO leads (name, company, email, phone, status, value, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, company, email, phone, status || 'New', value || 0, notes || '');
      
      const leadId = info.lastInsertRowid;
      if (notes) {
        db.prepare(`
          INSERT INTO lead_notes (lead_id, content, type)
          VALUES (?, ?, ?)
        `).run(leadId, notes, 'general');
      }

      const newLead = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId);
      res.status(201).json(newLead);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    const { name, company, email, phone, status, value, notes } = req.body;
    try {
      const oldLead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);
      
      db.prepare(`
        UPDATE leads 
        SET name = ?, company = ?, email = ?, phone = ?, status = ?, value = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, company, email, phone, status, value, notes, id);
      
      if (notes && notes !== oldLead.notes) {
        db.prepare(`
          INSERT INTO lead_notes (lead_id, content, type)
          VALUES (?, ?, ?)
        `).run(id, notes, 'general');
      }

      const updatedLead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);
      res.json(updatedLead);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM leads WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
