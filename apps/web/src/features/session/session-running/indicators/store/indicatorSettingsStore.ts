import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getIndicatorDefinition,
  type IndicatorConfig,
  type IndicatorType,
} from "../toolkit";

interface IndicatorSettingsState {
  indicators: IndicatorConfig[];
  addIndicator: (type: IndicatorType) => IndicatorConfig | null;
  updateIndicator: (id: string, changes: Partial<IndicatorConfig>) => void;
  removeIndicator: (id: string) => void;
  toggleIndicator: (id: string) => void;
  duplicateIndicator: (id: string) => void;
  reorderIndicator: (id: string, direction: "up" | "down") => void;
  replaceIndicators: (next: IndicatorConfig[]) => void;
  reset: () => void;
}

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `indicator-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const resequence = (list: IndicatorConfig[]): IndicatorConfig[] =>
  list.map((indicator, index) => ({
    ...indicator,
    order: index,
  }));

interface PersistedState {
  indicators: IndicatorConfig[];
}

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage<PersistedState>(() => window.localStorage);

/**
 * Persisted store for managing custom indicators
 */
export const useIndicatorSettingsStore = create<IndicatorSettingsState>()(
  persist(
    (set, get) => ({
      indicators: [],
      addIndicator: (type) => {
        const definition = getIndicatorDefinition(type);
        if (!definition) {
          return null;
        }

        const next = definition.getDefaultConfig(
          createId(),
          get().indicators.length,
        );
        set({ indicators: [...get().indicators, next] });
        return next;
      },
      updateIndicator: (id, changes) => {
        set((state) => ({
          indicators: state.indicators.map((indicator) =>
            indicator.id === id
              ? ({ ...indicator, ...changes } as IndicatorConfig)
              : indicator,
          ),
        }));
      },
      removeIndicator: (id) => {
        set((state) => ({
          indicators: resequence(
            state.indicators.filter((indicator) => indicator.id !== id),
          ),
        }));
      },
      toggleIndicator: (id) => {
        set((state) => ({
          indicators: state.indicators.map((indicator) =>
            indicator.id === id
              ? { ...indicator, isEnabled: !indicator.isEnabled }
              : indicator,
          ),
        }));
      },
      duplicateIndicator: (id) => {
        const source = get().indicators.find(
          (indicator) => indicator.id === id,
        );
        if (!source) {
          return;
        }
        const duplicate: IndicatorConfig = {
          ...source,
          id: createId(),
          name: `${source.name} Copy`,
          order: get().indicators.length,
        };
        set((state) => ({
          indicators: [...state.indicators, duplicate],
        }));
      },
      reorderIndicator: (id, direction) => {
        set((state) => {
          const index = state.indicators.findIndex(
            (indicator) => indicator.id === id,
          );
          if (index === -1) {
            return state;
          }
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= state.indicators.length) {
            return state;
          }
          const updated = [...state.indicators];
          const [item] = updated.splice(index, 1);
          updated.splice(targetIndex, 0, item);
          return { indicators: resequence(updated) };
        });
      },
      replaceIndicators: (next) => {
        set({ indicators: resequence(next) });
      },
      reset: () => set({ indicators: [] }),
    }),
    {
      name: "running-session.indicators",
      storage,
      partialize: (state) => ({
        indicators: state.indicators,
      }),
    },
  ),
);
