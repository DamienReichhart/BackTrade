import { useParams, Link } from "react-router-dom";
import { TransactionDetailsModal } from "../session-running/components/TransactionDetailsModal";
import { useTransactionsList } from "./hooks/useTransactionsList";
import { formatDateTime } from "@backtrade/utils";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import styles from "./TransactionsList.module.css";

/**
 * Transactions List page for a session
 *
 * Displays all transactions for a session with server-side search, sorting, and pagination.
 * Users can sort by any column by clicking on the column header.
 */
export function TransactionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const {
        session,
        transactions,
        isLoadingTransactions,
        searchQuery,
        page,
        limit,
        setPage,
        isModalOpen,
        selectedTransaction,
        handleSearchChange,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    } = useTransactionsList();

    const hasResults = transactions.length > 0;
    const hasMore = transactions.length === limit;

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
                        Transactions - Session #{session?.id ?? id}
                    </h1>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.badge}>
                        {isLoadingTransactions
                            ? "Loading..."
                            : `Page ${page}${hasResults ? ` (${transactions.length} shown)` : ""}`}
                    </span>
                </div>
            </div>

            {/* Search Control */}
            <div className={styles.searchContainer}>
                <Input
                    type="text"
                    placeholder="Search by transaction type..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                />
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
                                    onClick={() => handleSort("created_at")}
                                >
                                    Time{getSortIndicator("created_at")}
                                </th>
                                <th
                                    className={styles.sortableHeader}
                                    onClick={() =>
                                        handleSort("transaction_type")
                                    }
                                >
                                    Type{getSortIndicator("transaction_type")}
                                </th>
                                <th
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort("amount")}
                                >
                                    Amount{getSortIndicator("amount")}
                                </th>
                                <th
                                    className={styles.sortableHeader}
                                    onClick={() => handleSort("balance_after")}
                                >
                                    Balance After
                                    {getSortIndicator("balance_after")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingTransactions && (
                                <tr>
                                    <td className={styles.empty} colSpan={5}>
                                        Loading transactions...
                                    </td>
                                </tr>
                            )}
                            {!isLoadingTransactions &&
                                transactions.length === 0 && (
                                    <tr>
                                        <td
                                            className={styles.empty}
                                            colSpan={5}
                                        >
                                            No transactions found
                                        </td>
                                    </tr>
                                )}
                            {!isLoadingTransactions &&
                                transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className={styles.clickableRow}
                                        onClick={() =>
                                            handleRowClick(transaction)
                                        }
                                    >
                                        <td>#{transaction.id}</td>
                                        <td>
                                            {transaction.created_at
                                                ? formatDateTime(
                                                      transaction.created_at
                                                  )
                                                : "—"}
                                        </td>
                                        <td>{transaction.transaction_type}</td>
                                        <td
                                            className={
                                                transaction.amount >= 0
                                                    ? styles.amountPos
                                                    : styles.amountNeg
                                            }
                                        >
                                            {transaction.amount.toFixed(2)}
                                        </td>
                                        <td>
                                            {transaction.balance_after.toFixed(
                                                2
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {hasResults && (
                    <div className={styles.pagination}>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoadingTransactions}
                        >
                            Previous
                        </Button>
                        <span className={styles.pageInfo}>Page {page}</span>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasMore || isLoadingTransactions}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            <TransactionDetailsModal
                transaction={selectedTransaction}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}
