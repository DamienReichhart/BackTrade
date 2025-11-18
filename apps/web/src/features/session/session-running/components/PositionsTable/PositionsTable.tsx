import styles from "./PositionsTable.module.css";
import { PositionDetailsModal } from "../PositionDetailsModal";
import { ClosePositionButton, EditablePriceInput } from "./components";
import { usePositionsTable } from "../../hooks";
import { formatPnL, getPnLClassName } from "./utils";
import { useCurrentSessionStore } from "../../../../../store/session";

/**
 * Table for open positions as in the mockup.
 */
export function PositionsTable() {
  const {
    openPositions,
    loading,
    isModalOpen,
    selectedPosition,
    handleRowClick,
    handleManageClick,
    closeModal,
  } = usePositionsTable();
  const { currentSessionInstrument } = useCurrentSessionStore();
  const pipSize = currentSessionInstrument?.pip_size ?? 1;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>Open positions</span>
            <span className={styles.badge}>PnL in €</span>
          </div>
          <button
            type="button"
            className={styles.manageBtn}
            onClick={handleManageClick}
          >
            Manage
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Side</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>PnL</th>
                <th>SL</th>
                <th>TP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className={styles.empty} colSpan={8}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && openPositions.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={8}>
                    No open positions
                  </td>
                </tr>
              )}
              {!loading &&
                openPositions.map((p) => (
                  <tr
                    key={p.id}
                    className={styles.clickableRow}
                    onClick={() => handleRowClick(p)}
                  >
                    <td className={p.side === "BUY" ? styles.buy : styles.sell}>
                      {p.side}
                    </td>
                    <td>{p.quantity_lots}</td>
                    <td>{p.entry_price}</td>
                    <td className={styles[getPnLClassName(p.realized_pnl)]}>
                      {formatPnL(p.realized_pnl)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <EditablePriceInput
                        positionId={p.id}
                        value={p.sl_price}
                        pipSize={pipSize}
                        type="sl"
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <EditablePriceInput
                        positionId={p.id}
                        value={p.tp_price}
                        pipSize={pipSize}
                        type="tp"
                      />
                    </td>
                    <td>{p.position_status}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ClosePositionButton positionId={p.id} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <PositionDetailsModal
        position={selectedPosition}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
