import express, {
  type Express,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { router as apiRouter } from "./routes/router";
import { HealthSchema } from "@backtrade/types";
import { requestId } from "./middlewares/request-id";
import { requestLogger } from "./middlewares/request-logger";
import { errorHandler } from "./middlewares/error-handler";

function createApp(): Express {
  const app: Express = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "100mb" }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(requestId);
  app.use(requestLogger);

  apiRouter.get("/health", (_req: Request, res: Response) => {
    const health = HealthSchema.parse({
      status: "ok",
      time: new Date().toISOString(),
    });
    res.json(health);
  });

  app.use("/api/v1", apiRouter);

  app.use(errorHandler);

  return app;
}

export { createApp };
