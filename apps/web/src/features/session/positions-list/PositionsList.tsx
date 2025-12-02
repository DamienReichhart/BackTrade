import { useParams, Link } from "react-router-dom";
import { PositionDetailsModal } from "../session-running/components/PositionDetailsModal";
import { usePositionsList } from "./hooks/usePositionsList";
import { formatDateTime } from "@backtrade/utils";
import styles from "./PositionsList.module.css";

/**
 * Positions List page for a session
 *
 * Displays all positions for a session with sorting capabilities.
 * Users can sort by any column by clicking on the column header.
 */
export function PositionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const {
        session,
        sortedPositions,
        isLoadingPositions,
        isModalOpen,
        selectedPosition,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    } = usePositionsList();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link
                        to={`/dashboard/sessions/${id}`}
                        className={styles.backLink}
                    >
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
                            : `${sortedPositions.length} position${sortedPositions.length !== 1 ? "s" : ""}`}
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
                                    onClick={() =>
                                        handleSort("position_status")
                                    }
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
                            {!isLoadingPositions &&
                                sortedPositions.length === 0 && (
                                    <tr>
                                        <td
                                            className={styles.empty}
                                            colSpan={10}
                                        >
                                            No positions found
                                        </td>
                                    </tr>
                                )}
                            {!isLoadingPositions &&
                                sortedPositions.map((position) => (
                                    <tr
                                        key={position.id}
                                        className={styles.clickableRow}
                                        onClick={() => handleRowClick(position)}
                                    >
                                        <td>#{position.id}</td>
                                        <td
                                            className={
                                                position.side === "BUY"
                                                    ? styles.buy
                                                    : styles.sell
                                            }
                                        >
                                            {position.side}
                                        </td>
                                        <td>{position.quantity_lots}</td>
                                        <td>
                                            {position.entry_price.toFixed(5)}
                                        </td>
                                        <td
                                            className={
                                                (position.realized_pnl ?? 0) >=
                                                0
                                                    ? styles.pnlPos
                                                    : styles.pnlNeg
                                            }
                                        >
                                            {Number(
                                                position.realized_pnl ?? 0
                                            ).toFixed(2)}
                                        </td>
                                        <td>
                                            {position.sl_price
                                                ? position.sl_price.toFixed(5)
                                                : "-"}
                                        </td>
                                        <td>
                                            {position.tp_price
                                                ? position.tp_price.toFixed(5)
                                                : "-"}
                                        </td>
                                        <td>{position.position_status}</td>
                                        <td>
                                            {position.opened_at
                                                ? formatDateTime(
                                                      position.opened_at
                                                  )
                                                : "-"}
                                        </td>
                                        <td>
                                            {position.closed_at
                                                ? formatDateTime(
                                                      position.closed_at
                                                  )
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
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}
