import { useState, useMemo } from "react";
import type { Session, SearchQuery } from "@backtrade/types";
import { useSessions } from "../../../api/hooks/requests/sessions";

export type SortField =
  | "id"
  | "name"
  | "session_status"
  | "created_at"
  | "updated_at"
  | "initial_balance"
  | "leverage"
  | "start_ts";

export type SortOrder = "asc" | "desc";

/**
 * Hook to manage session list data and state with search, sorting, and pagination
 *
 * @returns Session list data, loading state, error, and control handlers
 */
export function useSessionList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  // Build search query with filters
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

  const { data, isLoading, error } = useSessions(query);

  const sessions: Session[] = (data as Session[]) ?? [];

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  /**
   * Handle sort field change
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field with default desc order
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1); // Reset to first page on sort
  };

  /**
   * Handle sort order change
   */
  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setPage(1); // Reset to first page on sort
  };

  return {
    // State
    searchQuery,
    sortField,
    sortOrder,
    page,
    limit,
    sessions,
    isLoading,
    error: error as Error | null,

    // Handlers
    handleSearchChange,
    handleSort,
    handleSortOrderChange,
    setPage,
  };
}
