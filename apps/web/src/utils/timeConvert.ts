import type { Timeframe } from "@backtrade/types";

/**
 * Helper function to convert timeframe to milliseconds
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
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  // Fallback to formatted date string
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate the date range for fetching a specific number of candles
 * based on the timeframe and current timestamp.
 * @param timeframe - The timeframe (e.g., M1, M5, H1, etc.)
 * @param currentTs - The current timestamp (ISO datetime string)
 * @param candleCount - Number of candles to fetch (default: 200)
 * @returns DateRangeQuery with ts_gte and ts_lte
 */
export function calculateCandleDateRange(
  timeframe: Timeframe,
  currentTs: string,
  candleCount: number = 200,
): { ts_gte: string; ts_lte: string } {
  const timeframeMs = timeframeToMilliseconds(timeframe);
  const totalMs = timeframeMs * candleCount;
  const currentDate = new Date(currentTs);
  const startDate = new Date(currentDate.getTime() - totalMs);

  // Format as ISO datetime strings (YYYY-MM-DDTHH:mm:ssZ)
  const formatISO = (date: Date): string => {
    return date.toISOString().slice(0, 19) + "Z";
  };

  return {
    ts_gte: formatISO(startDate),
    ts_lte: formatISO(currentDate),
  };
}
