import { useSessions } from "../../../../api/requests/sessions";
import { SessionCard } from "../SessionCard";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";
import type { Session } from "@backtrade/types";
import styles from "./SessionList.module.css";

/**
 * Session list component
 *
 * Displays a list of trading sessions fetched from the API
 */
export function SessionList() {
  const { data, isLoading, error } = useSessions();
  const sessions = (data as Session[]) || [];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (sessions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.sessionList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Sessions</h2>
        <p className={styles.description}>
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className={styles.grid}>
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

