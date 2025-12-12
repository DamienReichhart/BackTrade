import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDatasets } from "../../../../api/hooks/requests/datasets";
import type { Dataset } from "@backtrade/types";

export type SortField =
    | "id"
    | "instrument_id"
    | "timeframe"
    | "file_name"
    | "records_count"
    | "uploaded_at"
    | "start_time"
    | "end_time"
    | "created_at"
    | "updated_at";
export type SortOrder = "asc" | "desc";

/**
 * Hook for managing dataset management page state and logic
 */
export function useDatasetManagement() {
    const navigate = useNavigate();

    // Sort state
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [timeframeFilter, setTimeframeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Fetch datasets
    const {
        data: datasetsData,
        isLoading,
        error,
        execute: refetchDatasets,
    } = useDatasets();
    const datasets: Dataset[] = Array.isArray(datasetsData) ? datasetsData : [];

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = useMemo(() => {
        return (
            searchQuery.length > 0 ||
            timeframeFilter.length > 0 ||
            statusFilter.length > 0
        );
    }, [searchQuery, timeframeFilter, statusFilter]);

    /**
     * Handle sort field change
     */
    const handleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
                setSortField(field);
                setSortOrder("desc");
            }
        },
        [sortField, sortOrder]
    );

    /**
     * Handle search query change
     */
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    /**
     * Handle timeframe filter change
     */
    const handleTimeframeChange = useCallback((timeframe: string) => {
        setTimeframeFilter(timeframe);
    }, []);

    /**
     * Handle status filter change
     */
    const handleStatusChange = useCallback((status: string) => {
        setStatusFilter(status);
    }, []);

    /**
     * Clear all filters
     */
    const handleClearFilters = useCallback(() => {
        setSearchQuery("");
        setTimeframeFilter("");
        setStatusFilter("");
    }, []);

    /**
     * Navigate back to admin choices
     */
    const handleBackToAdmin = useCallback(() => {
        navigate("/dashboard/admin");
    }, [navigate]);

    /**
     * Filter datasets based on search and filters
     */
    const filteredDatasets = useMemo(() => {
        return datasets.filter((dataset) => {
            // Search filter - match file name or instrument ID
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesFileName =
                    dataset.file_name?.toLowerCase().includes(query) ?? false;
                const matchesInstrumentId = String(dataset.instrument_id)
                    .toLowerCase()
                    .includes(query);

                if (!matchesFileName && !matchesInstrumentId) {
                    return false;
                }
            }

            // Timeframe filter
            if (timeframeFilter && dataset.timeframe !== timeframeFilter) {
                return false;
            }

            // Status filter
            if (statusFilter) {
                const hasFile = !!dataset.file_name;
                if (statusFilter === "uploaded" && !hasFile) {
                    return false;
                }
                if (statusFilter === "pending" && hasFile) {
                    return false;
                }
            }

            return true;
        });
    }, [datasets, searchQuery, timeframeFilter, statusFilter]);

    /**
     * Sort datasets based on current sort field and order
     */
    const sortedDatasets = useMemo(() => {
        const sorted = [...filteredDatasets];
        sorted.sort((a, b) => {
            let aValue: string | number | boolean;
            let bValue: string | number | boolean;

            switch (sortField) {
                case "id":
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case "instrument_id":
                    aValue = a.instrument_id;
                    bValue = b.instrument_id;
                    break;
                case "timeframe":
                    aValue = a.timeframe;
                    bValue = b.timeframe;
                    break;
                case "file_name":
                    aValue = a.file_name ?? "";
                    bValue = b.file_name ?? "";
                    break;
                case "records_count":
                    aValue = a.records_count ?? 0;
                    bValue = b.records_count ?? 0;
                    break;
                case "uploaded_at":
                    aValue = a.uploaded_at
                        ? new Date(a.uploaded_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    bValue = b.uploaded_at
                        ? new Date(b.uploaded_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    break;
                case "start_time":
                    aValue = a.start_time
                        ? new Date(a.start_time).getTime()
                        : Number.NEGATIVE_INFINITY;
                    bValue = b.start_time
                        ? new Date(b.start_time).getTime()
                        : Number.NEGATIVE_INFINITY;
                    break;
                case "end_time":
                    aValue = a.end_time
                        ? new Date(a.end_time).getTime()
                        : Number.NEGATIVE_INFINITY;
                    bValue = b.end_time
                        ? new Date(b.end_time).getTime()
                        : Number.NEGATIVE_INFINITY;
                    break;
                case "created_at":
                    aValue = a.created_at
                        ? new Date(a.created_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    bValue = b.created_at
                        ? new Date(b.created_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    break;
                case "updated_at":
                    aValue = a.updated_at
                        ? new Date(a.updated_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    bValue = b.updated_at
                        ? new Date(b.updated_at).getTime()
                        : Number.NEGATIVE_INFINITY;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredDatasets, sortField, sortOrder]);

    return {
        // State
        sortField,
        sortOrder,
        datasets: sortedDatasets,
        allDatasets: datasets,
        isLoading,
        error,

        // Filter state
        searchQuery,
        timeframeFilter,
        statusFilter,
        hasActiveFilters,

        // Handlers
        handleSort,
        handleSearchChange,
        handleTimeframeChange,
        handleStatusChange,
        handleClearFilters,
        handleBackToAdmin,
        refetchDatasets,
    };
}
