import { getDb } from "../utils/db.js";

import seedProjects from "./data/projects.json" with { type: "json" };

const db = getDb();

/*
  Upsert by slug so this is safe to rerun: projects in the seed file are brought
  up to date, and any row you added by hand under a different slug is left
  alone. contact_messages is never touched.
*/
const upsert = db.prepare(`
  INSERT INTO projects (slug, title, description, tags, year, demo_url, source_url, featured, sort_order)
  VALUES (@slug, @title, @description, @tags, @year, @demo_url, @source_url, @featured, @sort_order)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    tags = excluded.tags,
    year = excluded.year,
    demo_url = excluded.demo_url,
    source_url = excluded.source_url,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    updated_at = datetime('now')
`);

const upsertMany = db.transaction((projects) => {
  for (const project of projects) {
    upsert.run(project);
  }
});

upsertMany(seedProjects);

const seedSlugs = seedProjects.map((project) => project.slug);
const placeholders = seedSlugs.map(() => "?").join(", ");
const removed = db
  .prepare(`DELETE FROM projects WHERE slug NOT IN (${placeholders})`)
  .run(...seedSlugs);

console.log(
  `Applied ${seedProjects.length} projects from the seed file` +
    (removed.changes ? ` (removed ${removed.changes} leftover row(s))` : "") +
    "."
);
