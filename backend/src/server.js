import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./utils/config.js";
import api from "./routes/index.js";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return config.corsOrigins[0];
      return config.corsOrigins.includes(origin) ? origin : config.corsOrigins[0];
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/", (c) =>
  c.json({
    name: "samspace-api",
    docs: {
      health: "GET /api/health",
      projects: "GET /api/projects",
      project: "GET /api/projects/:slug",
      contact: "POST /api/contact",
    },
  })
);

app.route("/api", api);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`samspace-api running at http://localhost:${info.port}`);
  }
);
