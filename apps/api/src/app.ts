import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { apiRouter } from "./routes/router";
import { requestId } from "./middlewares/request-id";
import { requestLogger } from "./middlewares/request-logger";
import { notFoundHandler } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";

function createApp(): Express {
  const app: Express = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(requestId);
  app.use(requestLogger);

  app.use("/api", apiRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

export { createApp };
