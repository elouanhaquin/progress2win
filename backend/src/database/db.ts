import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'progress2win.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper function to run queries
export const query = (text: string, params: any[] = []) => {
  try {
    if (text.trim().toUpperCase().startsWith('SELECT') || 
        text.trim().toUpperCase().startsWith('SHOW')) {
      const stmt = db.prepare(text);
      const rows = stmt.all(...params);
      return { rows };
    } else {
      const stmt = db.prepare(text);
      const info = stmt.run(...params);
      return { rows: [info], rowCount: info.changes };
    }
  } catch (error: any) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const queryOne = (text: string, params: any[] = []) => {
  const stmt = db.prepare(text);
  return { rows: [stmt.get(...params)] };
};

export default db;
