import type { Session } from "@backtrade/types";

/**
 * Get status color class name
 *
 * @param status - Session status
 * @returns CSS class name for status color
 */
export function getSessionStatusColorClass(status: string): string {
  switch (status) {
    case "RUNNING":
      return "statusRunning";
    case "PAUSED":
      return "statusPaused";
    case "COMPLETED":
      return "statusCompleted";
    case "DRAFT":
      return "statusDraft";
    case "ARCHIVED":
      return "statusArchived";
    default:
      return "";
  }
}

/**
 * Get session display name
 *
 * @param session - Session object
 * @returns Display name for the session
 */
export function getSessionDisplayName(session: Session): string {
  return session.name ?? `Session #${session.id}`;
}

/**
 * Check if session is active (running or paused)
 *
 * @param session - Session to check
 * @returns True if session is running or paused
 */
export function isSessionActive(session: Session): boolean {
  return (
    session.session_status === "RUNNING" || session.session_status === "PAUSED"
  );
}
