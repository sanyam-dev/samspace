import fs from "node:fs";
import path from "node:path";
import { listProjects } from "../utils/repositories.js";

const outputPath = path.resolve(import.meta.dirname, "../../../data/projects.json");

const projects = listProjects().map(({ id, createdAt, updatedAt, ...project }) => project);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(projects, null, 2)}\n`);

console.log(`Exported ${projects.length} projects to ${outputPath}`);
