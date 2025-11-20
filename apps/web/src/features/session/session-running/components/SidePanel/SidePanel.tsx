import styles from "./SidePanel.module.css";
import {
  useCurrentPriceStore,
  useCurrentSessionStore,
} from "../../../../../store/session";
import { useOrderForm, usePositionCreation } from "../../hooks";
import { isOrderFormDisabled } from "./utils";
import { SessionControls } from "../TopBar/components/SessionControls/SessionControls";

/**
 * Right-side panel with order ticket and session controls.
 */
export function SidePanel() {
  const currency = "€";
  const { currentPrice } = useCurrentPriceStore();
  const { currentSession, currentSessionInstrument } = useCurrentSessionStore();

  // Order form state management
  const pipSize = currentSessionInstrument?.pip_size ?? 1;
  const form = useOrderForm(pipSize);
  const { createPositionWithSide, isCreatingPosition } =
    usePositionCreation(form);

  // Cost/estimates from session
  const spreadPts = currentSession?.spread_pts ?? 0;
  const slippagePts = currentSession?.slippage_pts ?? 0;
  const commission = currentSession?.commission_per_fill ?? 0;

  const handleBuy = () => {
    createPositionWithSide("BUY", form.qty, form.tp, form.sl);
  };

  const handleSell = () => {
    createPositionWithSide("SELL", form.qty, form.tp, form.sl);
  };

  const isDisabled = isOrderFormDisabled(
    !!currentSession?.id,
    !!currentPrice,
    isCreatingPosition,
    form.qty,
  );

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.sectionHeader}>Order ticket</div>
        <div className={styles.formGrid}>
          <label className={styles.label}>Symbol</label>
          <div className={styles.input}>
            {currentSessionInstrument?.symbol ?? "-"}
          </div>

          <label className={styles.label}>Qty (lots)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            step={0.01}
            value={form.qty}
            onChange={(e) => form.setQty(Number(e.target.value))}
          />

          <label className={styles.label}>TP</label>
          <input
            className={styles.input}
            type="number"
            step={pipSize}
            value={form.tp ?? ""}
            onChange={(e) => form.setTp(Number(e.target.value))}
            placeholder={
              currentPrice !== undefined ? currentPrice.toString() : ""
            }
          />

          <label className={styles.label}>SL</label>
          <input
            className={styles.input}
            type="number"
            step={pipSize}
            value={form.sl ?? ""}
            onChange={(e) => form.setSl(Number(e.target.value))}
            placeholder={
              currentPrice !== undefined ? currentPrice.toString() : ""
            }
          />
        </div>

        <div className={styles.inlineInfo}>
          <span>Spread {spreadPts}pt</span>
          <span>Slippage {slippagePts}pt</span>
          <span>
            Commission {currency}
            {commission.toFixed(2)}
          </span>
        </div>

        {form.error && <div className={styles.error}>{form.error}</div>}

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.buy}`}
            onClick={handleBuy}
            disabled={isDisabled}
          >
            {isCreatingPosition ? "Creating..." : "Buy Market"}
          </button>
          <button
            className={`${styles.btn} ${styles.sell}`}
            onClick={handleSell}
            disabled={isDisabled}
          >
            {isCreatingPosition ? "Creating..." : "Sell Market"}
          </button>
        </div>
      </div>

      {/* Session Controls */}
      <div className={styles.controlsWrapper}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>Session controls</div>
          <SessionControls />
        </div>
      </div>
    </div>
  );
}
