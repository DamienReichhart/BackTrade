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
import { WebSocketServer } from "ws";
import http from "http";
import { ENV } from "./config/env";
import stripeController from "./controllers/stripe-controller";
import { setupWebSocket } from "./websocket";

interface AppContext {
    server: http.Server;
    wss: WebSocketServer;
}

function createApp(): AppContext {
    const app: Express = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    app.disable("x-powered-by");

    if (ENV.NODE_ENV === "production") {
        app.set("trust proxy", true);
    }

    app.use(helmet());
    app.use(cors({ origin: true, credentials: true }));
    app.use(compression());

    // IMPORTANT: Stripe webhook must receive raw body for signature verification
    // This route MUST be registered BEFORE the global express.json() middleware
    app.post(
        "/api/v1/stripe/webhook",
        express.raw({ type: "application/json" }),
        stripeController.handleWebhook.bind(stripeController)
    );

    app.use(express.json());
    app.use(rateLimit({ windowMs: 60_000, max: 1200 }));
    app.use(requestId);
    app.use(requestLogger);

    app.use("/api", apiRouter);

    app.use(notFoundHandler);

    app.use(errorHandler);

    setupWebSocket(wss);

    return { server, wss };
}

export { createApp, type AppContext };
