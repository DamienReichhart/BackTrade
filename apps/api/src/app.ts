import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { router } from "./routes/index.js";
import type { Request, Response, NextFunction } from "express";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(pinoHttp());

  router.get("/health", (_req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() }),
  );

  app.use("/api", router);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next; // preserve 4-arg signature for Express error middleware without unused-var lint error
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}
