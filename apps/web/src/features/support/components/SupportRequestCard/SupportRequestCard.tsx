import type { SupportRequest } from "@backtrade/types";
import { formatDate } from "../../../../utils";
import styles from "./SupportRequestCard.module.css";

interface SupportRequestCardProps {
  request: SupportRequest;
}

/**
 * Support request card component
 *
 * Displays a summary of a support request with status and metadata
 */
export function SupportRequestCard({ request }: SupportRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return styles.statusOpen;
      case "PENDING_APPROVAL":
        return styles.statusPending;
      case "CLOSED":
        return styles.statusClosed;
      default:
        return "";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Request #{request.id}</h3>
          <span
            className={`${styles.status} ${getStatusColor(request.support_status)}`}
          >
            {request.support_status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Requester ID:</span>
            <span className={styles.value}>#{request.requester_id}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={styles.date}>
              Created {formatDate(request.created_at)}
            </span>
            {request.updated_at !== request.created_at && (
              <span className={styles.date}>
                Updated {formatDate(request.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
