import { type Session, SESSION_STATUS } from "@backtrade/types";

/**
 * Count sessions that count against the active-session quota
 * (anything not archived).
 */
export function countActiveSessions(sessions: Session[]): number {
    return sessions.filter(
        (session) => session.session_status !== SESSION_STATUS.ARCHIVED
    ).length;
}
