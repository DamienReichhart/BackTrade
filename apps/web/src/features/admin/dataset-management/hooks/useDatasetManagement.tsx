import { useState, useMemo } from "react";
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
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const {
    data: datasetsData,
    isLoading,
    error,
    execute: refetchDatasets,
  } = useDatasets();
  const datasets: Dataset[] = Array.isArray(datasetsData) ? datasetsData : [];

  /**
   * Handle sort field change
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  /**
   * Navigate back to admin choices
   */
  const handleBackToAdmin = () => {
    navigate("/dashboard/admin");
  };

  /**
   * Sort datasets based on current sort field and order
   */
  const sortedDatasets = useMemo(() => {
    const sorted = [...datasets];
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
  }, [datasets, sortField, sortOrder]);

  return {
    // State
    sortField,
    sortOrder,
    datasets: sortedDatasets,
    isLoading,
    error,

    // Handlers
    handleSort,
    handleBackToAdmin,
    refetchDatasets,
  };
}
