import { Hono } from "hono";
import { config } from "../utils/config.js";
import contact from "./contact.js";
import projects from "./projects.js";

const api = new Hono();

api.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "samspace-api",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  })
);

api.route("/projects", projects);
api.route("/contact", contact);

export default api;
