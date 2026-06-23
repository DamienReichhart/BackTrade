import { type Session, SESSION_STATUS } from "@backtrade/types";
import { type BadgeVariant } from "../../../components/Badge";

/**
 * Map a session status to a Badge variant.
 *
 * @param status - Session status
 * @returns Semantic badge variant for the status
 */
export function getSessionStatusVariant(status: string): BadgeVariant {
    switch (status) {
        case SESSION_STATUS.RUNNING:
            return "success";
        case SESSION_STATUS.PAUSED:
            return "warning";
        case SESSION_STATUS.ARCHIVED:
            return "neutral";
        default:
            return "neutral";
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
