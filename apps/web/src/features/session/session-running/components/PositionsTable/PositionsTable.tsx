import { useParams, useNavigate } from "react-router-dom";
import styles from "./PositionsTable.module.css";
import type { Position } from "@backtrade/types";
import { PositionDetailsModal } from "../PositionDetailsModal";
import { useModal } from "../../../../../hooks/useModal";
import { ClosePositionButton } from "./components";
import { useCurrentSessionStore } from "../../../../../context/CurrentSessionContext";
import { usePositionsBySession } from "../../../../../api/hooks/requests/positions";

/**
 * Table for open positions as in the mockup.
 */
export function PositionsTable() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : id;
  const hasValidSession = !!sessionId && sessionId !== "";

  const {
    isOpen,
    selectedItem: selectedPosition,
    openModal,
    closeModal,
  } = useModal<Position>();

  const { data: positionsData, isLoading: loading } = usePositionsBySession(
    sessionId,
    undefined,
    { enabled: hasValidSession },
  );

  const positions: Position[] = Array.isArray(positionsData)
    ? positionsData.map((p) => ({
        ...p,
        realized_pnl: p.realized_pnl ?? 0,
        commission_cost: p.commission_cost ?? 0,
        slippage_cost: p.slippage_cost ?? 0,
        spread_cost: p.spread_cost ?? 0,
        created_at: p.created_at ?? "",
        updated_at: p.updated_at ?? "",
      }))
    : [];

  // Filter to show only OPEN positions
  const openPositions = positions.filter((p) => p.position_status === "OPEN");

  const handleRowClick = (position: Position) => {
    openModal(position);
  };

  const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!hasValidSession) {
      return;
    }
    navigate(`/sessions/${sessionId}/positions/list`);
  };

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
                    <td
                      className={
                        (p.realized_pnl ?? 0) >= 0
                          ? styles.pnlPos
                          : styles.pnlNeg
                      }
                    >
                      {Number(p.realized_pnl ?? 0).toFixed(2)}
                    </td>
                    <td>{p.sl_price ?? "-"}</td>
                    <td>{p.tp_price ?? "-"}</td>
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
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
}
