import { InfoPanel } from "../../../components";

/**
 * Login information panel component
 *
 * Displays branding, headline, description, and feature tags on the left side
 */
export function LoginInfoPanel() {
  return (
    <InfoPanel
      label="Trading backtesting platform"
      headline="Deterministic historical trading. Multi-session. Fast."
      description="Launch sessions at any timestamp. Trade like it's live. Control speed and track PnL with strict fixed spread, slippage, and commission models."
    />
  );
}
