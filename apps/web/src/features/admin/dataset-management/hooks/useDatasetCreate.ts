import { useState, useCallback } from "react";
import { useCreateDataset } from "../../../../api/hooks/requests/datasets";
import type { Timeframe } from "@backtrade/types";
import { validateTimeframe } from "../utils/validation";

/**
 * Form state for dataset creation
 */
export interface DatasetFormState {
  instrument_id: string;
  timeframe: Timeframe | "";
}

/**
 * Hook for managing dataset creation form state and logic
 *
 * This hook handles:
 * - Form state management
 * - Validation
 * - Dataset creation API call
 *
 * @returns Object containing form state, handlers, and mutation
 */
export function useDatasetCreate() {
  const [formState, setFormState] = useState<DatasetFormState>({
    instrument_id: "",
    timeframe: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data, error: apiError, isLoading, execute } = useCreateDataset();

  /**
   * Handle form field change
   */
  const handleChange = useCallback(
    (field: keyof DatasetFormState, value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  /**
   * Validate form data
   */
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate instrument_id (just check if selected)
    if (!formState.instrument_id || formState.instrument_id.trim() === "") {
      newErrors.instrument_id = "Please select an instrument";
    }

    // Validate timeframe
    const timeframeValidation = validateTimeframe(formState.timeframe);
    if (!timeframeValidation.isValid) {
      newErrors.timeframe = timeframeValidation.error ?? "Invalid timeframe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return null;
    }

    try {
      const result = await execute({
        instrument_id: Number(formState.instrument_id),
        timeframe: formState.timeframe as Timeframe,
      });

      // Reset form on success
      setFormState({
        instrument_id: "",
        timeframe: "",
      });
      setErrors({});

      return result;
    } catch {
      return null;
    }
  }, [formState, validate, execute]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormState({
      instrument_id: "",
      timeframe: "",
    });
    setErrors({});
  }, []);

  return {
    // Form state
    formState,
    errors,

    // API state
    data,
    apiError,
    isLoading,

    // Handlers
    handleChange,
    handleSubmit,
    resetForm,
  };
}
