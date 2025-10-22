const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const { router: apiRouter } = require("./routes/index");

function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "100mb" }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(pinoHttp());

  apiRouter.get("/health", (_req: any, res: any) =>
    res.json({ status: "ok", time: new Date().toISOString() }),
  );

  app.use("/api/v1", apiRouter);

  app.use((err: unknown, _req: any, res: any, _next: any) => {
    void _next; // preserve 4-arg signature for Express error middleware without unused-var lint error
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

module.exports = { createApp };
