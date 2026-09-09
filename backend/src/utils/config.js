import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  databasePath: process.env.DATABASE_PATH || "./data/samspace.db",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5500")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
