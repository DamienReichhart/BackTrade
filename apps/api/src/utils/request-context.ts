/**
 * Request Context Utilities
 *
 * Utilities for extracting contextual information from HTTP requests
 */

import type { Request } from "express";

/** Device information extracted from request */
export interface DeviceInfo {
    /** Device type description */
    device: string;
    /** Browser name and version */
    browser: string;
}

/**
 * Extract device and browser information from request headers
 *
 * @param req - Express request object
 * @returns Device and browser information
 */
export function getDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.headers["user-agent"] ?? "";

    return {
        device: parseDevice(userAgent),
        browser: parseBrowser(userAgent),
    };
}

/**
 * Parse device type from user agent string
 */
function parseDevice(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android") && ua.includes("mobile")) return "Android Phone";
    if (ua.includes("android")) return "Android Tablet";

    // Desktop OS
    if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
    if (ua.includes("windows")) return "Windows PC";
    if (ua.includes("linux")) return "Linux PC";
    if (ua.includes("chromeos")) return "Chromebook";

    return "Unknown Device";
}

/**
 * Parse browser name and version from user agent string
 */
function parseBrowser(userAgent: string): string {
    const ua = userAgent;

    // Order matters - check more specific patterns first
    const browsers: Array<{ pattern: RegExp; name: string }> = [
        { pattern: /Edg\/(\d+)/, name: "Edge" },
        { pattern: /OPR\/(\d+)/, name: "Opera" },
        { pattern: /Chrome\/(\d+)/, name: "Chrome" },
        { pattern: /Safari\/(\d+).*Version\/(\d+)/, name: "Safari" },
        { pattern: /Firefox\/(\d+)/, name: "Firefox" },
        { pattern: /MSIE (\d+)/, name: "Internet Explorer" },
        { pattern: /Trident.*rv:(\d+)/, name: "Internet Explorer" },
    ];

    for (const { pattern, name } of browsers) {
        const match = ua.match(pattern);
        if (match) {
            // Safari has version in a different capture group
            const version = name === "Safari" ? match[2] : match[1];
            return `${name} ${version}`;
        }
    }

    return "Unknown Browser";
}

/**
 * Get client IP address from request
 *
 * @param req - Express request object
 * @returns Client IP address
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        const firstIp = forwarded.split(",")[0];
        return firstIp?.trim() ?? "Unknown";
    }
    return req.ip ?? req.socket.remoteAddress ?? "Unknown";
}

/**
 * Format date for email display
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatLoginDate(date: Date = new Date()): string {
    return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}
