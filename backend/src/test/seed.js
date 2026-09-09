import { getDb } from "../utils/db.js";

import seedProjects from "./data/projects.json" with { type: "json" };

const db = getDb();

const count = db.prepare("SELECT COUNT(*) AS count FROM projects").get().count;

if (count > 0) {
  console.log(`Database already has ${count} project(s). Skipping seed.`);
  process.exit(0);
}

const insert = db.prepare(`
  INSERT INTO projects (slug, title, description, tags, demo_url, source_url, featured, sort_order)
  VALUES (@slug, @title, @description, @tags, @demo_url, @source_url, @featured, @sort_order)
`);

const insertMany = db.transaction((projects) => {
  for (const project of projects) {
    insert.run(project);
  }
});

insertMany(seedProjects);

console.log(`Seeded ${seedProjects.length} projects.`);
