import { useCallback, useState, useEffect } from "react";
import { Input } from "../../../../../components/Input";
import { Select } from "../../../../../components/Select";
import { Button } from "../../../../../components/Button";
import type { SelectOption } from "../../../../../types/ui";
import styles from "./SearchFilter.module.css";

/**
 * SearchFilter component props
 */
interface SearchFilterProps {
    /**
     * Current search query
     */
    searchQuery: string;

    /**
     * Callback when search query changes
     */
    onSearchChange: (query: string) => void;

    /**
     * Current timeframe filter
     */
    timeframeFilter: string;

    /**
     * Callback when timeframe filter changes
     */
    onTimeframeChange: (timeframe: string) => void;

    /**
     * Current status filter
     */
    statusFilter: string;

    /**
     * Callback when status filter changes
     */
    onStatusChange: (status: string) => void;

    /**
     * Callback to clear all filters
     */
    onClearFilters: () => void;

    /**
     * Whether any filters are active
     */
    hasActiveFilters: boolean;
}

const timeframeOptions: SelectOption[] = [
    { value: "", label: "All Timeframes" },
    { value: "M1", label: "M1 (1 Minute)" },
    { value: "M5", label: "M5 (5 Minutes)" },
    { value: "M10", label: "M10 (10 Minutes)" },
    { value: "M15", label: "M15 (15 Minutes)" },
    { value: "M30", label: "M30 (30 Minutes)" },
    { value: "H1", label: "H1 (1 Hour)" },
    { value: "H2", label: "H2 (2 Hours)" },
    { value: "H4", label: "H4 (4 Hours)" },
    { value: "D1", label: "D1 (1 Day)" },
    { value: "W1", label: "W1 (1 Week)" },
];

const statusOptions: SelectOption[] = [
    { value: "", label: "All Status" },
    { value: "uploaded", label: "Uploaded" },
    { value: "pending", label: "Pending Upload" },
];

/**
 * SearchFilter component
 *
 * Provides search and filter controls for the dataset table
 */
export function SearchFilter({
    searchQuery,
    onSearchChange,
    timeframeFilter,
    onTimeframeChange,
    statusFilter,
    onStatusChange,
    onClearFilters,
    hasActiveFilters,
}: SearchFilterProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                onSearchChange(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, onSearchChange]);

    // Sync external search changes
    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalSearch(e.target.value);
        },
        []
    );

    const handleClearSearch = useCallback(() => {
        setLocalSearch("");
        onSearchChange("");
    }, [onSearchChange]);

    return (
        <div className={styles.container}>
            <div className={styles.searchWrapper}>
                <div className={styles.searchInputWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <Input
                        type="text"
                        placeholder="Search by file name or instrument..."
                        value={localSearch}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    {localSearch && (
                        <button
                            className={styles.clearSearchButton}
                            onClick={handleClearSearch}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.filterItem}>
                    <Select
                        value={timeframeFilter}
                        options={timeframeOptions}
                        onChange={onTimeframeChange}
                        placeholder="Timeframe"
                    />
                </div>

                <div className={styles.filterItem}>
                    <Select
                        value={statusFilter}
                        options={statusOptions}
                        onChange={onStatusChange}
                        placeholder="Status"
                    />
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={onClearFilters}
                        className={styles.clearButton}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
