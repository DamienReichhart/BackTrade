import { Link } from "react-router-dom";
import type { Session } from "@backtrade/types";
import { formatDate } from "@backtrade/utils";
import { useSessionCard } from "../../hooks/useSessionCard";
import { getSessionStatusColorClass } from "../../utils/sessions";
import { API_BASE_URL } from "../../../../api";
import styles from "./SessionCard.module.css";

interface SessionCardProps {
  session: Session;
}

/**
 * Session card component
 *
 * Displays information about a trading session
 */
export function SessionCard({ session }: SessionCardProps) {
  const { instrumentDisplay, sessionName, isLoadingInstrument } =
    useSessionCard(session);

  const getStatusColor = (status: string) => {
    const colorClass = getSessionStatusColorClass(status);
    return colorClass ? (styles[colorClass] ?? "") : "";
  };

  const linkRoute =
    session.session_status === "ARCHIVED"
      ? `${API_BASE_URL}/sessions/${session.id}/analyticsFile`
      : `/dashboard/sessions/${session.id}`;

  return (
    <Link to={linkRoute} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{sessionName}</h3>
          <span
            className={`${styles.status} ${getStatusColor(session.session_status)}`}
          >
            {session.session_status}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Instrument:</span>
            <span
              className={`${styles.value} ${isLoadingInstrument ? styles.loading : ""}`}
            >
              {instrumentDisplay}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Initial Balance:</span>
            <span className={styles.value}>
              ${session.initial_balance.toLocaleString()}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Leverage:</span>
            <span className={styles.value}>{session.leverage}x</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={styles.date}>
              Created {formatDate(session.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
