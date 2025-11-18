import { useNavigate } from "react-router-dom";
import type { Transaction } from "@backtrade/types";
import { useModal } from "../../../../hooks/useModal";
import { useCurrentSessionStore } from "../../../../store/session";
import { useTransactionsBySession } from "../../../../api/hooks/requests/transactions";

/**
 * Hook to manage transactions table data and interactions
 *
 * @returns Transactions table state and handlers
 */
export function useTransactionsTable() {
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

  return {
    transactions,
    loading,
    isModalOpen: isOpen,
    selectedTransaction,
    handleRowClick,
    handleManageClick,
    closeModal,
  };
}
