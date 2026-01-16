/**
 * Rate Limiting Middleware
 *
 * Provides endpoint-specific rate limiters for sensitive authentication endpoints.
 * These limiters enforce stricter thresholds than the global rate limit to prevent
 * brute-force attacks.
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { ENV } from "../config/env";

/**
 * Rate limiter for login endpoint
 *
 * Limits login attempts to 5 per 15 minutes per IP address.
 * This prevents brute-force attacks on user credentials.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: "Too many login attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Use IP address for tracking (works behind proxy in production)
    keyGenerator: (req) => {
        // In production, trust proxy is enabled, so req.ip will be the client IP
        const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
        return ip === "unknown" ? ip : ipKeyGenerator(ip);
    },
    // Skip rate limiting in test environment
    skip: () => ENV.NODE_ENV === "test",
});

/**
 * Rate limiter for password reset endpoint
 *
 * Limits password reset attempts to 5 per 15 minutes per IP address.
 * This prevents brute-force attacks on 6-digit verification codes.
 * Without this, an attacker could attempt all 1,000,000 possible codes
 * in approximately 14 hours using the global rate limit (1200 req/min).
 */
export const passwordResetRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: "Too many password reset attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Use IP address for tracking (works behind proxy in production)
    keyGenerator: (req) => {
        // In production, trust proxy is enabled, so req.ip will be the client IP
        const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
        return ip === "unknown" ? ip : ipKeyGenerator(ip);
    },
    // Skip rate limiting in test environment
    skip: () => ENV.NODE_ENV === "test",
});
