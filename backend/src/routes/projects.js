import { Hono } from "hono";
import { getProjectBySlug, listProjects } from "../utils/repositories.js";

const projects = new Hono();

projects.get("/", (c) => {
  const featuredOnly = c.req.query("featured") === "true";
  const items = listProjects({ featuredOnly });
  return c.json({ data: items });
});

projects.get("/:slug", (c) => {
  const project = getProjectBySlug(c.req.param("slug"));

  if (!project) {
    return c.json({ error: "Project not found" }, 404);
  }

  return c.json({ data: project });
});

export default projects;
