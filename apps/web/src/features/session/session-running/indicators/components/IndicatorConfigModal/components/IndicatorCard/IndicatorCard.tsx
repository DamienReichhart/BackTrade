import { memo } from "react";
import { Toggle } from "../../../../../../../../components/Toggle";
import type { IndicatorConfig } from "../../../../toolkit";
import styles from "./IndicatorCard.module.css";

interface IndicatorCardProps {
  indicator: IndicatorConfig;
  summary: string;
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onToggle: (value: boolean) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Card representing an active indicator instance
 */
export const IndicatorCard = memo(
  ({
    indicator,
    summary,
    isSelected,
    canMoveUp,
    canMoveDown,
    onSelect,
    onToggle,
    onDuplicate,
    onRemove,
    onMoveUp,
    onMoveDown,
  }: IndicatorCardProps) => {
    const handleCardClick = () => {
      onSelect();
    };

    const handleToggle = (value: boolean) => {
      onToggle(value);
    };

    const handleAction =
      (action: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        action();
      };

    return (
      <div
        className={`${styles.card} ${isSelected ? styles.selected : ""}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: getIndicatorColor(indicator) }}
              aria-hidden
            />
            <div>
              <p className={styles.name}>{indicator.name}</p>
              <p className={styles.summary}>{summary}</p>
            </div>
          </div>
          <Toggle checked={indicator.isEnabled} onChange={handleToggle} />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleAction(onDuplicate)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleAction(onRemove)}
          >
            Remove
          </button>
          <div className={styles.moveGroup}>
            <button
              type="button"
              className={styles.moveButton}
              onClick={handleAction(onMoveUp)}
              disabled={!canMoveUp}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.moveButton}
              onClick={handleAction(onMoveDown)}
              disabled={!canMoveDown}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    );
  },
);

IndicatorCard.displayName = "IndicatorCard";

function getIndicatorColor(indicator: IndicatorConfig): string {
  if ("color" in indicator) {
    return indicator.color;
  }
  if ("basisColor" in indicator) {
    return indicator.basisColor;
  }
  return "var(--color-accent)";
}
