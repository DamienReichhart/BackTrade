import type { PublicUser } from "@backtrade/types";
import { formatDate } from "@backtrade/utils";
import { Button } from "../../../../../components";
import { useModalBehavior } from "../../../../../hooks/useModalBehavior";
import {
  getRoleBadgeClassName,
  getStatusBadgeClassName,
  getStatusLabel,
} from "./utils";
import styles from "./UserDetailsModal.module.css";

/**
 * User Details Modal component props
 */
interface UserDetailsModalProps {
  /**
   * User to display
   */
  user: PublicUser;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;
}

/**
 * User Details Modal component
 *
 * Modal for viewing user details in read-only mode
 */
export function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  // Handle modal behavior (Escape key, body scroll)
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
      >
        <div className={styles.header}>
          <h2 id="user-details-title" className={styles.title}>
            User Details
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.row}>
              <span className={styles.label}>ID:</span>
              <span className={styles.value}>{user.id}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Role:</span>
              <span
                className={`${styles.badge} ${
                  styles[getRoleBadgeClassName(user.role)]
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Status:</span>
              <span
                className={`${styles.badge} ${
                  styles[getStatusBadgeClassName(user.is_banned)]
                }`}
              >
                {getStatusLabel(user.is_banned)}
              </span>
            </div>
            {user.stripe_customer_id && (
              <div className={styles.row}>
                <span className={styles.label}>Stripe Customer ID:</span>
                <span className={styles.value}>{user.stripe_customer_id}</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.row}>
              <span className={styles.label}>Created At:</span>
              <span className={styles.value}>
                {formatDate(user.created_at)}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Updated At:</span>
              <span className={styles.value}>
                {formatDate(user.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="primary" size="medium" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
