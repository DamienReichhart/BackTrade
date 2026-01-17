import { useState, useMemo, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import type { Transaction, SearchQuery, SortOrder } from "@backtrade/types";
import { useSession } from "../../../../api/hooks/requests/sessions";
import { useTransactionsBySession } from "../../../../api/hooks/requests/transactions";
import { useModal } from "../../../../hooks/useModal";
import type { TransactionSortField } from "../utils/sorting";

/**
 * Hook to manage transactions list data, search, sorting, pagination, and modal state
 *
 * @returns Transactions list state and handlers
 */
export function useTransactionsList() {
    const { id = "" } = useParams<{ id: string }>();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortField, setSortField] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [page, setPage] = useState<number>(1);
    const limit = 30;

    const {
        isOpen,
        selectedItem: selectedTransaction,
        openModal,
        closeModal,
    } = useModal<Transaction>();

    const { data: session } = useSession(id);

    // Build query with search, pagination and sorting
    const query: SearchQuery = useMemo(() => {
        const searchParams: SearchQuery = {
            page,
            limit,
            sort: sortField,
            order: sortOrder,
        };

        if (searchQuery.trim()) {
            searchParams.q = searchQuery.trim();
        }

        return searchParams;
    }, [searchQuery, page, limit, sortField, sortOrder]);

    const { data: transactionsData, isLoading: isLoadingTransactions } =
        useTransactionsBySession(id, query);

    // Normalize transactions data
    const transactions: Transaction[] = useMemo(() => {
        if (!Array.isArray(transactionsData)) return [];
        return transactionsData;
    }, [transactionsData]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page on search
    };

    /**
     * Handle column header click to toggle sorting
     */
    const handleSort = (field: TransactionSortField) => {
        const fieldString = field as string;
        if (sortField === fieldString) {
            // Toggle order if clicking the same field
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set new field with default descending order
            setSortField(fieldString);
            setSortOrder("desc");
        }
        setPage(1); // Reset to first page on sort change
    };

    /**
     * Get sort indicator for column header
     */
    const getSortIndicator = (field: TransactionSortField) => {
        if (sortField !== (field as string)) return null;
        return sortOrder === "asc" ? " ↑" : " ↓";
    };

    const handleRowClick = (transaction: Transaction) => {
        openModal(transaction);
    };

    return {
        session,
        transactions,
        isLoadingTransactions,
        searchQuery,
        sortField,
        sortOrder,
        page,
        limit,
        setPage,
        isModalOpen: isOpen,
        selectedTransaction,
        handleSearchChange,
        handleSort,
        getSortIndicator,
        handleRowClick,
        closeModal,
    };
}
