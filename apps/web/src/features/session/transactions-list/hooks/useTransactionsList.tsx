import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Transaction } from "@backtrade/types";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { useTransactionsBySession } from "../../../../api/hooks/requests/transactions";
import { useModal } from "../../../../hooks/useModal";
import {
    sortTransactions,
    type TransactionSortField,
    type SortOrder,
} from "../utils/sorting";

/**
 * Hook to manage transactions list data, sorting, and modal state
 *
 * @returns Transactions list state and handlers
 */
export function useTransactionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const [sortField, setSortField] =
        useState<TransactionSortField>("created_at");
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

    // Normalize transactions data
    const transactions: Transaction[] = useMemo(() => {
        if (!Array.isArray(transactionsData)) return [];
        return transactionsData;
    }, [transactionsData]);

    // Sort transactions based on current sort field and order
    const sortedTransactions = useMemo(() => {
        return sortTransactions(transactions, sortField, sortOrder);
    }, [transactions, sortField, sortOrder]);

    /**
     * Handle column header click to toggle sorting
     */
    const handleSort = (field: TransactionSortField) => {
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
     * Get sort indicator for column header
     */
    const getSortIndicator = (field: TransactionSortField) => {
        if (sortField !== field) return null;
        return sortOrder === "asc" ? " ↑" : " ↓";
    };

    const handleRowClick = (transaction: Transaction) => {
        openModal(transaction);
    };

    return {
        session,
        transactions,
        sortedTransactions,
        isLoadingTransactions,
        sortField,
        sortOrder,
        isModalOpen: isOpen,
        selectedTransaction,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    };
}
