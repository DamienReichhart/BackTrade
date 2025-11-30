import styles from "./TransactionsTable.module.css";
import { TransactionDetailsModal } from "../TransactionDetailsModal";
import { useTransactionsTable } from "../../hooks";
import { formatTime } from "@backtrade/utils";
import { formatAmount, getAmountClassName } from "./utils";

/**
 * Table listing account transactions (PNL, fees, deposits, withdrawals, etc.).
 */
export function TransactionsTable() {
  const {
    transactions,
    loading,
    isModalOpen,
    selectedTransaction,
    handleRowClick,
    handleManageClick,
    closeModal,
  } = useTransactionsTable();

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.sectionTitle}>Transactions</span>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleManageClick}
          >
            Manage
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Id</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className={styles.empty} colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={5}>
                    No transactions
                  </td>
                </tr>
              )}
              {!loading &&
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className={styles.clickableRow}
                    onClick={() => handleRowClick(t)}
                  >
                    <td>{t.created_at ? formatTime(t.created_at) : "—"}</td>
                    <td>#{t.id}</td>
                    <td>{t.transaction_type}</td>
                    <td className={styles[getAmountClassName(t.amount)]}>
                      {formatAmount(t.amount)}
                    </td>
                    <td>{formatAmount(t.balance_after)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
