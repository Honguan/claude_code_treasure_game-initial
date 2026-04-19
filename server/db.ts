import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const db = new DatabaseSync(path.join(__dirname, 'treasure.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score      INTEGER NOT NULL,
    won        INTEGER NOT NULL,
    played_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
`);

export default db;
