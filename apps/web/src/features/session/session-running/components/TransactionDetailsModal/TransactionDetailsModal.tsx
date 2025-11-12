import { Button } from "../../../../../components";
import type { Transaction } from "@backtrade/types";
import { formatDateTime } from "@backtrade/utils";
import { useModalBehavior } from "./hooks";
import styles from "./TransactionDetailsModal.module.css";

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component displaying detailed information about a transaction
 */
export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  useModalBehavior(isOpen, onClose);

  if (!isOpen || !transaction) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            Transaction Details
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
              <span className={styles.value}>#{transaction.id}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>
                {transaction.transaction_type}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Amount:</span>
              <span
                className={`${styles.value} ${
                  transaction.amount >= 0 ? styles.amountPos : styles.amountNeg
                }`}
              >
                €{transaction.amount.toFixed(2)}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Balance After:</span>
              <span className={styles.value}>
                {typeof transaction.balance_after === "number"
                  ? `€${transaction.balance_after.toFixed(2)}`
                  : "—"}
              </span>
            </div>
          </div>

          {transaction.position_id && (
            <div className={styles.section}>
              <div className={styles.row}>
                <span className={styles.label}>Position ID:</span>
                <span className={styles.value}>{transaction.position_id}</span>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.row}>
              <span className={styles.label}>Created At:</span>
              <span className={styles.value}>
                {formatDateTime(transaction.created_at)}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Updated At:</span>
              <span className={styles.value}>
                {formatDateTime(transaction.updated_at)}
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
