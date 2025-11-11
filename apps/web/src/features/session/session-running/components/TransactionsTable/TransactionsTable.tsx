import { useNavigate } from "react-router-dom";
import styles from "./TransactionsTable.module.css";
import type { Transaction } from "@backtrade/types";
import { TransactionDetailsModal } from "../TransactionDetailsModal";
import { useModal } from "../../../../../hooks/useModal";
import { useCurrentSessionStore } from "../../../../../context/CurrentSessionContext";
import { useTransactionsBySession } from "../../../../../api/hooks/requests/transactions";

/**
 * Table listing account transactions (PNL, fees, deposits, withdrawals, etc.).
 */
export function TransactionsTable() {
  const navigate = useNavigate();
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession ? String(currentSession.id) : "";
  const hasValidSession = !!sessionId && sessionId !== "";

  const {
    isOpen,
    selectedItem: selectedTransaction,
    openModal,
    closeModal,
  } = useModal<Transaction>();

  const { data: transactionsData, isLoading: loading } =
    useTransactionsBySession(sessionId, undefined, {
      enabled: hasValidSession,
    });

  const transactions: Transaction[] = Array.isArray(transactionsData)
    ? transactionsData
    : [];

  const handleRowClick = (transaction: Transaction) => {
    openModal(transaction);
  };

  const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!currentSession) {
      return;
    }
    navigate(`/sessions/${currentSession.id}/transactions/list`);
  };

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
                    <td>{new Date(t.created_at).toLocaleTimeString()}</td>
                    <td>#{t.id}</td>
                    <td>{t.transaction_type}</td>
                    <td
                      className={
                        t.amount >= 0 ? styles.amountPos : styles.amountNeg
                      }
                    >
                      {t.amount.toFixed(2)}
                    </td>
                    <td>{t.balance_after.toFixed(2)}</td>
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
    </>
  );
}
