import { InfoPanel } from "../../../components";

/**
 * Register information panel component
 *
 * Displays branding, headline, description, feature tags, and benefits on the left side
 */
export function RegisterInfoPanel() {
  return (
    <InfoPanel
      label="Trading backtesting platform"
      headline="Deterministic historical trading. Multi-session. Fast."
      description="Launch sessions at any timestamp. Trade like it's live. Control speed and track PnL with strict fixed spread, slippage, and commission models."
      benefits={{
        title: "Start trading the past today",
        items: [
          "Free plan with 1 active session",
          "Launch sessions in minutes",
          "Complete session reports",
          "Export data to JSON",
        ],
      }}
    />
  );
}
