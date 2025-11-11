import type { Timeframe } from "@backtrade/types";

/**
 * Helper function to convert timeframe to milliseconds
 *
 * @param timeframe - The timeframe to convert (e.g., M1, M5, H1, etc.)
 * @returns The timeframe duration in milliseconds
 */
export function timeframeToMilliseconds(timeframe: Timeframe): number {
  const timeframeMap: Record<Timeframe, number> = {
    M1: 1 * 60 * 1000, // 1 minute
    M5: 5 * 60 * 1000, // 5 minutes
    M10: 10 * 60 * 1000, // 10 minutes
    M15: 15 * 60 * 1000, // 15 minutes
    M30: 30 * 60 * 1000, // 30 minutes
    H1: 1 * 60 * 60 * 1000, // 1 hour
    H2: 2 * 60 * 60 * 1000, // 2 hours
    H4: 4 * 60 * 60 * 1000, // 4 hours
    D1: 24 * 60 * 60 * 1000, // 1 day
    W1: 7 * 24 * 60 * 60 * 1000, // 1 week
  };
  return timeframeMap[timeframe];
}

/**
 * Format a date string to a readable format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to a readable date-time format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date-time string (e.g., "Jan 15, 2024, 02:30:45 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a date string to a readable time format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted time string (e.g., "02:30:45 PM")
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
