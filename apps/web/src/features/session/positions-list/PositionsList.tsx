import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "../../../api/requests/sessions";
import { usePositionsBySession } from "../../../api/requests/positions";
import type { Position } from "@backtrade/types";
import { PositionDetailsModal } from "../session-running/components/PositionDetailsModal";
import { useModal } from "../../../hooks/useModal";
import styles from "./PositionsList.module.css";

type SortField =
  | "id"
  | "side"
  | "quantity_lots"
  | "entry_price"
  | "realized_pnl"
  | "sl_price"
  | "tp_price"
  | "position_status"
  | "opened_at"
  | "closed_at";
type SortOrder = "asc" | "desc";

/**
 * Positions List page for a session
 *
 * Displays all positions for a session with sorting capabilities.
 * Users can sort by any column by clicking on the column header.
 */
export function PositionsList() {
  const { id = "" } = useParams<{ id: string }>();
  const [sortField, setSortField] = useState<SortField>("opened_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const {
    isOpen,
    selectedItem: selectedPosition,
    openModal,
    closeModal,
  } = useModal<Position>();

  const { data: session } = useSession(id);
  const { data: positionsData, isLoading: isLoadingPositions } =
    usePositionsBySession(id);
  const positions = Array.isArray(positionsData) ? positionsData : [];

  /**
   * Handle column header click to toggle sorting
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default descending order
      setSortField(field);
      setSortOrder("desc");
    }
  };

  /**
   * Sorted positions based on current sort field and order
   */
  const sortedPositions = useMemo(() => {
    const sorted = [...positions];

    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "side":
          aValue = a.side;
          bValue = b.side;
          break;
        case "quantity_lots":
          aValue = a.quantity_lots;
          bValue = b.quantity_lots;
          break;
        case "entry_price":
          aValue = a.entry_price;
          bValue = b.entry_price;
          break;
        case "realized_pnl":
          aValue = a.realized_pnl ?? 0;
          bValue = b.realized_pnl ?? 0;
          break;
        case "sl_price":
          aValue = a.sl_price ?? 0;
          bValue = b.sl_price ?? 0;
          break;
        case "tp_price":
          aValue = a.tp_price ?? 0;
          bValue = b.tp_price ?? 0;
          break;
        case "position_status":
          aValue = a.position_status;
          bValue = b.position_status;
          break;
        case "opened_at":
          aValue = a.opened_at ? new Date(a.opened_at).getTime() : 0;
          bValue = b.opened_at ? new Date(b.opened_at).getTime() : 0;
          break;
        case "closed_at":
          aValue = a.closed_at ? new Date(a.closed_at).getTime() : 0;
          bValue = b.closed_at ? new Date(b.closed_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [positions, sortField, sortOrder]);

  const handleRowClick = (position: Position) => {
    openModal(position);
  };

  /**
   * Get sort indicator for column header
   */
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to={`/dashboard/sessions/${id}`} className={styles.backLink}>
            ← Back to Session
          </Link>
          <h1 className={styles.title}>
            Positions - Session #{session?.id ?? id}
          </h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badge}>
            {isLoadingPositions
              ? "Loading..."
              : `${positions.length} position${positions.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("id")}
                >
                  ID{getSortIndicator("id")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("side")}
                >
                  Side{getSortIndicator("side")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("quantity_lots")}
                >
                  Qty{getSortIndicator("quantity_lots")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("entry_price")}
                >
                  Entry{getSortIndicator("entry_price")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("realized_pnl")}
                >
                  PnL{getSortIndicator("realized_pnl")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("sl_price")}
                >
                  SL{getSortIndicator("sl_price")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("tp_price")}
                >
                  TP{getSortIndicator("tp_price")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("position_status")}
                >
                  Status{getSortIndicator("position_status")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("opened_at")}
                >
                  Opened{getSortIndicator("opened_at")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("closed_at")}
                >
                  Closed{getSortIndicator("closed_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingPositions && (
                <tr>
                  <td className={styles.empty} colSpan={10}>
                    Loading positions...
                  </td>
                </tr>
              )}
              {!isLoadingPositions && sortedPositions.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={10}>
                    No positions found
                  </td>
                </tr>
              )}
              {!isLoadingPositions &&
                sortedPositions.map((position) => (
                  <tr
                    key={position.id}
                    className={styles.clickableRow}
                    onClick={() =>
                      handleRowClick({
                        ...position,
                        realized_pnl: position.realized_pnl ?? 0,
                      } as Position)
                    }
                  >
                    <td>#{position.id}</td>
                    <td
                      className={
                        position.side === "BUY" ? styles.buy : styles.sell
                      }
                    >
                      {position.side}
                    </td>
                    <td>{position.quantity_lots}</td>
                    <td>{position.entry_price.toFixed(5)}</td>
                    <td
                      className={
                        (position.realized_pnl ?? 0) >= 0
                          ? styles.pnlPos
                          : styles.pnlNeg
                      }
                    >
                      {Number(position.realized_pnl ?? 0).toFixed(2)}
                    </td>
                    <td>
                      {position.sl_price ? position.sl_price.toFixed(5) : "-"}
                    </td>
                    <td>
                      {position.tp_price ? position.tp_price.toFixed(5) : "-"}
                    </td>
                    <td>{position.position_status}</td>
                    <td>
                      {position.opened_at
                        ? new Date(position.opened_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {position.closed_at
                        ? new Date(position.closed_at).toLocaleString()
                        : "-"}
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
    </div>
  );
}
