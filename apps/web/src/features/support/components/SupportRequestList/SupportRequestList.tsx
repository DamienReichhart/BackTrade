import { Link } from "react-router-dom";
import type { SupportRequest } from "@backtrade/types";
import { SupportRequestCard } from "../SupportRequestCard";
import styles from "./SupportRequestList.module.css";

interface SupportRequestListProps {
  requests: SupportRequest[];
}

/**
 * Support request list component
 *
 * Displays a list of support requests with filtering and sorting options
 */
export function SupportRequestList({ requests }: SupportRequestListProps) {
  // Separate requests by status
  const openRequests = requests.filter((req) => req.support_status === "OPEN");
  const pendingRequests = requests.filter(
    (req) => req.support_status === "PENDING_APPROVAL",
  );
  const closedRequests = requests.filter(
    (req) => req.support_status === "CLOSED",
  );

  return (
    <div className={styles.list}>
      {/* Open Requests */}
      {openRequests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Open Requests ({openRequests.length})
          </h2>
          <div className={styles.grid}>
            {openRequests.map((request) => (
              <Link
                key={request.id}
                to={`/dashboard/support/${request.id}`}
                className={styles.link}
              >
                <SupportRequestCard request={request} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Pending Approval ({pendingRequests.length})
          </h2>
          <div className={styles.grid}>
            {pendingRequests.map((request) => (
              <Link
                key={request.id}
                to={`/dashboard/support/${request.id}`}
                className={styles.link}
              >
                <SupportRequestCard request={request} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Closed Requests */}
      {closedRequests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Closed Requests ({closedRequests.length})
          </h2>
          <div className={styles.grid}>
            {closedRequests.map((request) => (
              <Link
                key={request.id}
                to={`/dashboard/support/${request.id}`}
                className={styles.link}
              >
                <SupportRequestCard request={request} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
