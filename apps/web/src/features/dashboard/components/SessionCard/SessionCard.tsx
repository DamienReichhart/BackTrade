import { Link } from "react-router-dom";
import type { Session } from "@backtrade/types";
import { useInstrument } from "../../../../api/hooks/requests/instruments";
import { formatDate } from "../../../../utils/index";
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
  // Fetch instrument data with automatic caching via React Query
  const { data: instrument, isLoading: isLoadingInstrument } = useInstrument(
    String(session.instrument_id),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return styles.statusRunning;
      case "PAUSED":
        return styles.statusPaused;
      case "COMPLETED":
        return styles.statusCompleted;
      case "DRAFT":
        return styles.statusDraft;
      case "ARCHIVED":
        return styles.statusArchived;
      default:
        return "";
    }
  };

  // Display instrument name or fallback to ID while loading
  const instrumentDisplay = isLoadingInstrument
    ? `Loading...`
    : instrument
      ? instrument.display_name
      : `#${session.instrument_id}`;

  // Get the session display name
  const sessionName = session.name ?? `Session #${session.id}`;

  return (
    <Link to={`/dashboard/sessions/${session.id}`} className={styles.card}>
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
            <span className={styles.label}>Timeframe:</span>
            <span className={styles.value}>{session.timeframe}</span>
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
