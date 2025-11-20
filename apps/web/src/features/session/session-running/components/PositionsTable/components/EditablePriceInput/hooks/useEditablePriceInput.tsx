import { useState, useEffect, useRef, useCallback } from "react";
import { useUpdatePositionTpSl } from "../../../../../hooks/useUpdatePositionTpSl";

interface UseEditablePriceInputParams {
  positionId: number;
  value: number | null | undefined;
  type: "tp" | "sl";
  onUpdate?: () => void;
}

/**
 * Hook for managing editable price input state and logic
 *
 * This hook handles:
 * - Edit mode state management
 * - Input value synchronization with prop value
 * - Focus management when entering edit mode
 * - Value updates and validation
 * - Keyboard navigation (Enter, Escape)
 *
 * @param positionId - The position ID to update
 * @param value - Current TP/SL value
 * @param type - Whether this is for TP or SL
 * @param onUpdate - Callback to execute after successful update
 * @returns Object containing state, handlers, and refs
 */
export function useEditablePriceInput({
  positionId,
  value,
  type,
  onUpdate,
}: UseEditablePriceInputParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    value !== null && value !== undefined ? String(value) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateTpSl, isUpdating } = useUpdatePositionTpSl(positionId);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    const trimmedValue = inputValue.trim();
    const numValue = trimmedValue === "" ? null : Number(trimmedValue);

    // Check if value actually changed (handle null/undefined comparison)
    const currentValue = value ?? null;
    const newValue = numValue;

    if (newValue !== currentValue) {
      try {
        if (type === "tp") {
          await updateTpSl(newValue, undefined);
        } else {
          await updateTpSl(undefined, newValue);
        }
        onUpdate?.();
      } catch {
        // Reset to original value on error
        setInputValue(
          value !== null && value !== undefined ? String(value) : "",
        );
      }
    }
  }, [inputValue, value, type, updateTpSl, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        setInputValue(
          value !== null && value !== undefined ? String(value) : "",
        );
        setIsEditing(false);
      }
    },
    [value],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return {
    // State
    isEditing,
    inputValue,
    isUpdating,

    // Refs
    inputRef,

    // Handlers
    handleClick,
    handleBlur,
    handleKeyDown,
    handleChange,
    handleInputClick,
  };
}
