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
  | "is_active"
  | "uploaded_at"
  | "start_ts"
  | "end_ts"
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
          aValue = a.file_name;
          bValue = b.file_name;
          break;
        case "records_count":
          aValue = a.records_count;
          bValue = b.records_count;
          break;
        case "is_active":
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case "uploaded_at":
          aValue = new Date(a.uploaded_at).getTime();
          bValue = new Date(b.uploaded_at).getTime();
          break;
        case "start_ts":
          aValue = new Date(a.start_ts).getTime();
          bValue = new Date(b.start_ts).getTime();
          break;
        case "end_ts":
          aValue = new Date(a.end_ts).getTime();
          bValue = new Date(b.end_ts).getTime();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
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
