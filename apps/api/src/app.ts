import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { router as apiRouter } from "./routes/router.js";
import { HealthSchema } from "@backtrade/types";

function createApp(): Express {
  const app: Express = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(pinoHttp());

  apiRouter.get("/health", (_req: Request, res: Response) => {
    const health = HealthSchema.parse({
      status: "ok",
      time: new Date().toISOString(),
    });
    res.json(health);
  });

  app.use("/api/v1", apiRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next; // preserve 4-arg signature for Express error middleware without unused-var lint error
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

export { createApp };
