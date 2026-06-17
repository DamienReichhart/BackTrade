import { useCallback, useState, useEffect } from "react";
import { Input } from "../../../../../components/Input";
import { Select } from "../../../../../components/Select";
import { Button } from "../../../../../components/Button";
import type { SelectOption } from "../../../../../types/ui";
import { getTimeframeOptions } from "@backtrade/types";
import styles from "./SearchFilter.module.css";

interface SearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    timeframeFilter: string;
    onTimeframeChange: (timeframe: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const timeframeOptions: SelectOption[] = [
    { value: "", label: "All Timeframes" },
    ...getTimeframeOptions().map((opt) => ({
        value: opt.value,
        label: `${opt.value} (${opt.label})`,
    })),
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

    // Sync external search changes by adjusting state during render rather than
    // in an effect (avoids the cascading-render setState-in-effect antipattern).
    const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
    if (searchQuery !== prevSearchQuery) {
        setPrevSearchQuery(searchQuery);
        setLocalSearch(searchQuery);
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                onSearchChange(localSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, onSearchChange]);

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
