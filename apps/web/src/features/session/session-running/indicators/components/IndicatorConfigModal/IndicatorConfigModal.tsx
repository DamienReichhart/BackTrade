import { useState } from "react";
import { Button } from "../../../../../../components/Button";
import { useModalBehavior } from "../../../../../../hooks/useModalBehavior";
import { useIndicatorSettingsStore } from "../../store";
import {
  getIndicatorDefinition,
  indicatorList,
  type IndicatorConfig,
  type IndicatorType,
} from "../../toolkit";
import { getIndicatorSummary } from "../../utils";
import { IndicatorCard } from "./components/IndicatorCard";
import { IndicatorForm } from "./components/IndicatorForm";
import { IndicatorTypeCard } from "./components/IndicatorTypeCard";
import styles from "./IndicatorConfigModal.module.css";

interface IndicatorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full screen modal for configuring chart indicators
 */
export function IndicatorConfigModal({
  isOpen,
  onClose,
}: IndicatorConfigModalProps) {
  useModalBehavior(isOpen, onClose);

  const indicators = useIndicatorSettingsStore((state) => state.indicators);
  const addIndicator = useIndicatorSettingsStore((state) => state.addIndicator);
  const updateIndicator = useIndicatorSettingsStore(
    (state) => state.updateIndicator,
  );
  const removeIndicator = useIndicatorSettingsStore(
    (state) => state.removeIndicator,
  );
  const duplicateIndicator = useIndicatorSettingsStore(
    (state) => state.duplicateIndicator,
  );
  const reorderIndicator = useIndicatorSettingsStore(
    (state) => state.reorderIndicator,
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const derivedSelectedId = selectedId ?? indicators[0]?.id ?? null;
  const selectedIndicator = indicators.find(
    (indicator) => indicator.id === derivedSelectedId,
  );
  const selectedDefinition = selectedIndicator
    ? getIndicatorDefinition(selectedIndicator.type)
    : null;

  const handleAdd = (type: IndicatorType) => {
    const created = addIndicator(type);
    if (created) {
      setSelectedId(created.id);
    }
  };

  const handleRemove = (indicator: IndicatorConfig) => {
    removeIndicator(indicator.id);
    if (indicator.id === selectedId) {
      setSelectedId(null);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="indicator-modal-title"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Chart indicators</p>
            <h2 id="indicator-modal-title" className={styles.title}>
              Customize your view
            </h2>
            <p className={styles.subtitle}>
              Add, reorder, and configure overlays and oscillators for the
              running session chart. All changes persist locally for future
              sessions.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <div className={styles.sectionHeading}>
              <h3>Active Indicators</h3>
              <span className={styles.counter}>{indicators.length}</span>
            </div>
            <div className={styles.cardStack}>
              {indicators.length === 0 ? (
                <p className={styles.emptyState}>
                  No indicators yet. Add one from the list below.
                </p>
              ) : (
                indicators.map((indicator, index) => (
                  <IndicatorCard
                    key={indicator.id}
                    indicator={indicator}
                    summary={getIndicatorSummary(indicator)}
                    isSelected={indicator.id === derivedSelectedId}
                    canMoveUp={index > 0}
                    canMoveDown={index < indicators.length - 1}
                    onSelect={() => setSelectedId(indicator.id)}
                    onToggle={(value) =>
                      updateIndicator(indicator.id, { isEnabled: value })
                    }
                    onDuplicate={() => duplicateIndicator(indicator.id)}
                    onRemove={() => handleRemove(indicator)}
                    onMoveUp={() => reorderIndicator(indicator.id, "up")}
                    onMoveDown={() => reorderIndicator(indicator.id, "down")}
                  />
                ))
              )}
            </div>
            <div className={styles.sectionHeading}>
              <h3>Add Indicators</h3>
            </div>
            <div className={styles.library}>
              {indicatorList.map((definition) => (
                <IndicatorTypeCard
                  key={definition.type}
                  definition={definition as never}
                  onAdd={() => handleAdd(definition.type)}
                />
              ))}
            </div>
          </aside>
          <section className={styles.formPane}>
            {selectedIndicator && selectedDefinition ? (
              <IndicatorForm
                indicator={selectedIndicator}
                definition={selectedDefinition as never}
                onChange={(changes) =>
                  updateIndicator(selectedIndicator.id, changes)
                }
              />
            ) : (
              <div className={styles.placeholder}>
                <p>Select an indicator to edit its configuration.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
