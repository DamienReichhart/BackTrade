import { useState, useEffect, useRef } from "react";
import { useUpdatePositionTpSl } from "../../../../hooks/useUpdatePositionTpSl";
import styles from "./EditablePriceInput.module.css";

interface EditablePriceInputProps {
  positionId: number;
  value: number | null | undefined;
  pipSize: number;
  type: "tp" | "sl";
  onUpdate?: () => void;
}

/**
 * Editable input component for TP/SL prices in the positions table
 * Allows inline editing with immediate updates on blur
 */
export function EditablePriceInput({
  positionId,
  value,
  pipSize,
  type,
  onUpdate,
}: EditablePriceInputProps) {
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = async () => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setInputValue(value !== null && value !== undefined ? String(value) : "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step={pipSize}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={styles.input}
        disabled={isUpdating}
      />
    );
  }

  return (
    <span
      className={styles.editable}
      onClick={handleClick}
      title="Click to edit"
    >
      {value !== null && value !== undefined ? String(value) : "-"}
    </span>
  );
}
