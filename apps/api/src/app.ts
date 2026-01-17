import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./routes/router";
import { requestId } from "./middlewares/request-id";
import { requestLogger } from "./middlewares/request-logger";
import { notFoundHandler } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";
import http from "http";
import { ENV } from "./config/env";
import {
    securityHeaders,
    additionalSecurityHeaders,
    corsConfig,
} from "./config/security-headers";
import stripeController from "./controllers/stripe-controller";

interface AppContext {
    server: http.Server;
}

function createApp(): AppContext {
    const app: Express = express();
    const server = http.createServer(app);

    // Remove Express identification header
    app.disable("x-powered-by");

    // Trust proxy in production (required for correct IP addresses behind reverse proxy)
    if (ENV.NODE_ENV === "production") {
        app.set("trust proxy", true);
    }

    // Security headers configuration
    app.use(securityHeaders);

    // Additional security headers not covered by Helmet
    app.use(additionalSecurityHeaders);

    // CORS configuration with origin validation
    // In production: only allows requests from FRONTEND_URL
    // In development: allows all origins for easier testing
    app.use(cors(corsConfig));

    // IMPORTANT: Stripe webhook must receive raw body for signature verification
    // This route MUST be registered BEFORE compression and express.json() middleware
    // Register webhook route first to bypass any body-modifying middleware
    app.post(
        "/api/v1/stripe/webhook",
        express.raw({ type: "application/json" }),
        stripeController.handleWebhook.bind(stripeController)
    );

    // Apply compression AFTER webhook route to ensure webhook bypasses it
    app.use(compression());

    app.use(express.json());
    app.use(rateLimit({ windowMs: 60_000, max: 1200 }));
    app.use(requestId);
    app.use(requestLogger);

    app.use("/api", apiRouter);

    app.use(notFoundHandler);

    app.use(errorHandler);

    return { server };
}

export { createApp, type AppContext };
