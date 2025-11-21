import { SessionCard } from "../SessionCard";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";
import { useSessionList, type SortField } from "../../hooks";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { Button } from "../../../../components/Button";
import type { SelectOption } from "../../../../types/ui";
import styles from "./SessionList.module.css";

/**
 * Sort field options for session list
 */
const SORT_FIELD_OPTIONS: SelectOption[] = [
  { value: "created_at", label: "Created Date" },
  { value: "updated_at", label: "Updated Date" },
  { value: "name", label: "Name" },
  { value: "session_status", label: "Status" },
  { value: "initial_balance", label: "Initial Balance" },
  { value: "leverage", label: "Leverage" },
  { value: "start_ts", label: "Start Time" },
];

/**
 * Sort order options
 */
const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

/**
 * Session list component
 *
 * Displays a list of trading sessions with search, sorting, and pagination
 */
export function SessionList() {
  const {
    searchQuery,
    sortField,
    sortOrder,
    page,
    limit,
    sessions,
    isLoading,
    error,
    handleSearchChange,
    handleSort,
    handleSortOrderChange,
    setPage,
  } = useSessionList();

  if (error) {
    return <ErrorState error={error} />;
  }

  const hasResults = sessions.length > 0;
  const showEmptyState = !isLoading && !hasResults && page === 1;
  const showLoadingState = isLoading && page === 1 && !hasResults;

  return (
    <div className={styles.sessionList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Sessions</h2>
        <p className={styles.description}>
          {isLoading && !hasResults
            ? "Loading..."
            : hasResults
              ? `${sessions.length} session${sessions.length !== 1 ? "s" : ""} found`
              : "No sessions found"}
        </p>
      </div>

      {/* Search and Sort Controls */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Input
            type="text"
            placeholder="Search sessions by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sortContainer}>
          <Select
            value={sortField}
            onChange={(value) => handleSort(value as SortField)}
            options={SORT_FIELD_OPTIONS}
            placeholder="Sort by"
            className={styles.sortSelect}
          />
          <Select
            value={sortOrder}
            onChange={(value) => handleSortOrderChange(value as "asc" | "desc")}
            options={SORT_ORDER_OPTIONS}
            placeholder="Order"
            className={styles.sortSelect}
          />
        </div>
      </div>

      {/* Session Grid */}
      {showLoadingState ? (
        <LoadingState />
      ) : showEmptyState ? (
        <EmptyState />
      ) : (
        <>
          <div className={styles.grid}>
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>

          {/* Pagination */}
          {hasResults && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                size="small"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>Page {page}</span>
              <Button
                variant="outline"
                size="small"
                onClick={() => setPage((p) => p + 1)}
                disabled={sessions.length < limit || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
