import { useEditablePriceInput } from "./hooks";
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
  const {
    isEditing,
    inputValue,
    isUpdating,
    inputRef,
    handleClick,
    handleBlur,
    handleKeyDown,
    handleChange,
    handleInputClick,
  } = useEditablePriceInput({
    positionId,
    value,
    type,
    onUpdate,
  });

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step={pipSize}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleInputClick}
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
