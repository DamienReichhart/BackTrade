import { Button } from "../../../../../components";
import type { Position } from "@backtrade/types";
import { formatDateTime } from "@backtrade/utils";
import { useModalBehavior } from "../../../../../hooks/useModalBehavior";
import styles from "./PositionDetailsModal.module.css";

interface PositionDetailsModalProps {
    position: Position | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal component displaying detailed information about a position
 */
export function PositionDetailsModal({
    position,
    isOpen,
    onClose,
}: PositionDetailsModalProps) {
    useModalBehavior(isOpen, onClose);

    if (!isOpen || !position) return null;

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
                        Position Details
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
                            <span className={styles.label}>Status:</span>
                            <span className={styles.value}>
                                {position.position_status}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Side:</span>
                            <span
                                className={`${styles.value} ${
                                    position.side === "BUY"
                                        ? styles.buy
                                        : styles.sell
                                }`}
                            >
                                {position.side}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Entry Price:</span>
                            <span className={styles.value}>
                                {position.entry_price.toFixed(5)}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>
                                Take Profit (TP):
                            </span>
                            <span className={styles.value}>
                                {position.tp_price ?? "-"}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>
                                Stop Loss (SL):
                            </span>
                            <span className={styles.value}>
                                {position.sl_price ?? "-"}
                            </span>
                        </div>
                        {position.opened_at && (
                            <div className={styles.row}>
                                <span className={styles.label}>Opened At:</span>
                                <span className={styles.value}>
                                    {formatDateTime(position.opened_at)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.row}>
                            <span className={styles.label}>Realized P&L:</span>
                            <span
                                className={`${styles.value} ${
                                    (position.realized_pnl ?? 0) >= 0
                                        ? styles.pnlPos
                                        : styles.pnlNeg
                                }`}
                            >
                                €{(position.realized_pnl ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Commission:</span>
                            <span className={styles.value}>
                                €{(position.commission_cost ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Spread:</span>
                            <span className={styles.value}>
                                €{(position.spread_cost ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Slippage:</span>
                            <span className={styles.value}>
                                €{(position.slippage_cost ?? 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {position.closed_at && (
                        <div className={styles.section}>
                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Closed Price:
                                </span>
                                <span className={styles.value}>
                                    {position.exit_price ?? "-"}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Closed Time:
                                </span>
                                <span className={styles.value}>
                                    {formatDateTime(position.closed_at)}
                                </span>
                            </div>
                        </div>
                    )}

                    {(position.created_at ?? position.updated_at) && (
                        <div className={styles.section}>
                            {position.created_at && (
                                <div className={styles.row}>
                                    <span className={styles.label}>
                                        Created At:
                                    </span>
                                    <span className={styles.value}>
                                        {formatDateTime(position.created_at)}
                                    </span>
                                </div>
                            )}
                            {position.updated_at && (
                                <div className={styles.row}>
                                    <span className={styles.label}>
                                        Updated At:
                                    </span>
                                    <span className={styles.value}>
                                        {formatDateTime(position.updated_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
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
