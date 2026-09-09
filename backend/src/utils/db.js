import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

// Relative paths resolve against the backend package root rather than the
// launch directory, which would otherwise point at a different database file.
const backendRoot = path.resolve(import.meta.dirname, "../..");
const dbPath = path.isAbsolute(config.databasePath)
  ? config.databasePath
  : path.resolve(backendRoot, config.databasePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    year TEXT,
    demo_url TEXT,
    source_url TEXT,
    featured INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// CREATE TABLE IF NOT EXISTS leaves existing tables untouched, so columns added
// after a database already exists have to be applied explicitly.
const projectColumns = new Set(
  db.prepare("PRAGMA table_info(projects)").all().map((column) => column.name)
);

if (!projectColumns.has("year")) {
  db.exec("ALTER TABLE projects ADD COLUMN year TEXT");
}

export function getDb() {
  return db;
}

export function parseProjectRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: JSON.parse(row.tags),
    year: row.year,
    demoUrl: row.demo_url,
    sourceUrl: row.source_url,
    featured: Boolean(row.featured),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
