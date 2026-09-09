import { getDb, parseProjectRow } from "./db.js";

const selectProjects = `
  SELECT *
  FROM projects
  WHERE (? = 0 OR featured = 1)
  ORDER BY sort_order ASC, id ASC
`;

const selectProjectBySlug = `
  SELECT *
  FROM projects
  WHERE slug = ?
  LIMIT 1
`;

export function listProjects({ featuredOnly = false } = {}) {
  const db = getDb();
  const rows = db.prepare(selectProjects).all(featuredOnly ? 1 : 0);
  return rows.map(parseProjectRow);
}

export function getProjectBySlug(slug) {
  const db = getDb();
  const row = db.prepare(selectProjectBySlug).get(slug);
  return row ? parseProjectRow(row) : null;
}

export function createContactMessage({ name, email, message }) {
  const db = getDb();
  const result = db
    .prepare(
      `
      INSERT INTO contact_messages (name, email, message)
      VALUES (@name, @email, @message)
    `
    )
    .run({ name, email, message });

  return {
    id: result.lastInsertRowid,
    name,
    email,
    message,
  };
}
