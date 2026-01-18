import { type Session, SESSION_STATUS } from "@backtrade/types";

/**
 * Get status color class name
 *
 * @param status - Session status
 * @returns CSS class name for status color
 */
export function getSessionStatusColorClass(status: string): string {
    switch (status) {
        case SESSION_STATUS.RUNNING:
            return "statusRunning";
        case SESSION_STATUS.PAUSED:
            return "statusPaused";
        case SESSION_STATUS.ARCHIVED:
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
        session.session_status === SESSION_STATUS.RUNNING ||
        session.session_status === SESSION_STATUS.PAUSED
    );
}
