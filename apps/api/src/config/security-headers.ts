/**
 * Security Headers Configuration
 *
 * This module provides comprehensive security headers configuration for production environments.
 * It implements OWASP best practices.
 *
 * @see https://owasp.org/www-project-secure-headers/
 * @see https://helmetjs.github.io/
 */

import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { ENV } from "./env";
import { logger } from "../libs/pino";

/**
 * Security headers configuration.
 */
export const securityHeaders = helmet({
    // Content Security Policy
    // For JSON APIs, CSP is minimal - we only need frame-ancestors to prevent clickjacking
    contentSecurityPolicy: {
        useDefaults: false, // Disable defaults since we're an API
        directives: {
            // Prevent embedding in frames (clickjacking protection)
            frameAncestors: ["'none'"],
            // Block all object/embed/applet elements
            objectSrc: ["'none'"],
            // No default sources needed for JSON API
            defaultSrc: ["'none'"],
        },
    },

    // Strict Transport Security (HSTS)
    // Forces HTTPS-only communication
    strictTransportSecurity: {
        maxAge: 63_072_000, // 2 years (recommended for production)
        includeSubDomains: true, // Apply to all subdomains
        preload: true, // Allow inclusion in HSTS preload lists
    },

    // X-Content-Type-Options
    // Prevents MIME-sniffing attacks
    // Helmet enables this by default, but we're being explicit

    // X-Frame-Options
    // Prevents clickjacking (redundant with CSP frame-ancestors, but provides legacy browser support)
    frameguard: {
        action: "deny",
    },

    // Referrer Policy
    // Controls referrer information sent to other sites
    referrerPolicy: {
        policy: "strict-origin-when-cross-origin", // Balance between privacy and functionality
    },

    // Cross-Origin Policies
    // These headers help isolate cross-origin content and prevent side-channel leaks
    crossOriginOpenerPolicy: {
        policy: "same-origin", // Isolate browsing contexts
    },
    crossOriginResourcePolicy: {
        policy: "same-origin", // Restrict resource loading
    },
    crossOriginEmbedderPolicy: {
        policy: "require-corp", // Require cross-origin isolation
    },

    // Origin Agent Cluster
    // Enables origin-keyed agent clusters for better isolation
    originAgentCluster: true,

    // X-DNS-Prefetch-Control
    // Controls DNS prefetching (disabled for privacy)
    dnsPrefetchControl: {
        allow: false,
    },

    // X-Download-Options
    // Prevents IE8+ from executing downloads in the site's context
    // Helmet enables this by default for IE compatibility

    // X-Permitted-Cross-Domain-Policies
    // Restricts Adobe products from loading cross-domain content
    permittedCrossDomainPolicies: {
        permittedPolicies: "none",
    },
});

/**
 * Additional security headers middleware for API responses.
 * These headers are not covered by Helmet but are recommended by OWASP.
 */
export function additionalSecurityHeaders(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Cache-Control: Prevent caching of sensitive API responses
    // Only set if not already set by route handlers
    if (!res.getHeader("Cache-Control")) {
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, private, max-age=0"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    }

    // Server header: Remove server identification (handled by Helmet, but being explicit)
    res.removeHeader("Server");
    res.removeHeader("X-Powered-By"); // Already disabled in app.ts, but ensure it's removed

    // Permissions-Policy: Restrict powerful browser features
    const permissionsPolicyValue = [
        "accelerometer=()",
        "ambient-light-sensor=()",
        "autoplay=()",
        "battery=()",
        "camera=()",
        "cross-origin-isolated=()",
        "display-capture=()",
        "document-domain=()",
        "encrypted-media=()",
        "execution-while-not-rendered=()",
        "execution-while-out-of-viewport=()",
        "fullscreen=()",
        "geolocation=()",
        "gyroscope=()",
        "keyboard-map=()",
        "magnetometer=()",
        "microphone=()",
        "midi=()",
        "navigation-override=()",
        "payment=()",
        "picture-in-picture=()",
        "publickey-credentials=()",
        "screen-wake-lock=()",
        "sync-xhr=()",
        "usb=()",
        "web-share=()",
        "xr-spatial-tracking=()",
    ].join(", ");
    res.setHeader("Permissions-Policy", permissionsPolicyValue);

    // Content-Type: Ensure proper charset for JSON responses
    const contentType = res.getHeader("Content-Type")?.toString();
    if (contentType?.includes("application/json")) {
        const currentContentType = contentType ?? "";
        if (!currentContentType.includes("charset")) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
    }

    next();
}

/**
 * CORS configuration for production.
 * Restricts origins to the configured frontend URL only.
 */
export const corsConfig = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        // This is safe because credentials are only sent when origin matches
        if (!origin) {
            return callback(null, true);
        }

        // In production, only allow the configured frontend URL
        if (ENV.NODE_ENV === "production") {
            const allowedOrigin = ENV.FRONTEND_URL;
            if (origin === allowedOrigin) {
                return callback(null, true);
            }
            // Log unauthorized origin attempts in production
            const corsLogger = logger.child({ service: "cors" });
            corsLogger.warn(
                { origin },
                "Blocked request from unauthorized origin"
            );
            return callback(new Error("Not allowed by CORS"), false);
        }

        // In development, allow all origins for easier testing
        // WARNING: This should never be used in production
        callback(null, true);
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "X-Request-ID",
    ],
    exposedHeaders: ["X-Request-ID"], // Headers that can be accessed by client
    maxAge: 86400, // 24 hours - how long preflight requests can be cached
    optionsSuccessStatus: 204, // Use 204 for OPTIONS requests
};
