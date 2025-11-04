import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "../../../api/requests/sessions";
import { useTransactionsBySession } from "../../../api/requests/transactions";
import type { Transaction } from "@backtrade/types";
import { TransactionDetailsModal } from "../session-running/components/TransactionDetailsModal";
import { useModal } from "../../../hooks/useModal";
import styles from "./TransactionsList.module.css";

type SortField =
  | "id"
  | "transaction_type"
  | "amount"
  | "balance_after"
  | "created_at";
type SortOrder = "asc" | "desc";

/**
 * Transactions List page for a session
 *
 * Displays all transactions for a session with sorting capabilities.
 * Users can sort by any column by clicking on the column header.
 */
export function TransactionsList() {
  const { id = "" } = useParams<{ id: string }>();
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const {
    isOpen,
    selectedItem: selectedTransaction,
    openModal,
    closeModal,
  } = useModal<Transaction>();

  const { data: session } = useSession(id);
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useTransactionsBySession(id);
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];

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
   * Sorted transactions based on current sort field and order
   */
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];

    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "transaction_type":
          aValue = a.transaction_type;
          bValue = b.transaction_type;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "balance_after":
          aValue = a.balance_after;
          bValue = b.balance_after;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [transactions, sortField, sortOrder]);

  const handleRowClick = (transaction: Transaction) => {
    openModal(transaction);
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
            Transactions - Session #{session?.id ?? id}
          </h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badge}>
            {isLoadingTransactions
              ? "Loading..."
              : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
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
                  onClick={() => handleSort("created_at")}
                >
                  Time{getSortIndicator("created_at")}
                </th>
                <th
                  className={styles.sortableHeader}
                  onClick={() => handleSort("transaction_type")}
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
                  Balance After{getSortIndicator("balance_after")}
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
              {!isLoadingTransactions && sortedTransactions.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={5}>
                    No transactions found
                  </td>
                </tr>
              )}
              {!isLoadingTransactions &&
                sortedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={styles.clickableRow}
                    onClick={() => handleRowClick(transaction)}
                  >
                    <td>#{transaction.id}</td>
                    <td>{new Date(transaction.created_at).toLocaleString()}</td>
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
                    <td>{transaction.balance_after.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  );
}
