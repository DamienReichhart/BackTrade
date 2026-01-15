import styles from "./SidePanel.module.css";
import {
    useCurrentPriceStore,
    useCurrentSessionStore,
} from "../../../../../store/session";
import { useOrderForm, usePositionCreation } from "../../hooks";
import { isOrderFormDisabled } from "./utils";
import { SessionControls } from "../TopBar/components/SessionControls/SessionControls";
import type { OrderFormState } from "../../../../../types/forms";

/**
 * Right-side panel with order ticket and session controls.
 */
export function SidePanel() {
    const currency = "€";
    const { currentPrice } = useCurrentPriceStore();
    const { currentSession, currentSessionInstrument } =
        useCurrentSessionStore();

    // Order form state management
    const pipSize = currentSessionInstrument?.pip_size ?? 1;
    const form = useOrderForm(pipSize);
    const { createPositionWithSide, isCreatingPosition } =
        usePositionCreation(form);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = form;

    const qty = watch("qty");

    // Cost/estimates from session
    const spreadPts = currentSession?.spread_pts ?? 0;
    const slippagePts = currentSession?.slippage_pts ?? 0;
    const commission = currentSession?.commission_per_fill ?? 0;

    const onBuy = (data: OrderFormState) => {
        createPositionWithSide("BUY", data);
    };

    const onSell = (data: OrderFormState) => {
        createPositionWithSide("SELL", data);
    };

    const isDisabled = isOrderFormDisabled(
        !!currentSession?.id,
        !!currentPrice,
        isCreatingPosition,
        qty
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
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type="number"
                            min={0}
                            step={0.01}
                            {...register("qty")}
                        />
                        {errors.qty && (
                            <span className={styles.fieldError}>
                                {errors.qty.message}
                            </span>
                        )}
                    </div>

                    <label className={styles.label}>TP</label>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type="number"
                            step={pipSize}
                            placeholder={
                                currentPrice !== undefined
                                    ? currentPrice.toString()
                                    : ""
                            }
                            {...register("tp")}
                        />
                        {errors.tp && (
                            <span className={styles.fieldError}>
                                {errors.tp.message}
                            </span>
                        )}
                    </div>

                    <label className={styles.label}>SL</label>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type="number"
                            step={pipSize}
                            placeholder={
                                currentPrice !== undefined
                                    ? currentPrice.toString()
                                    : ""
                            }
                            {...register("sl")}
                        />
                        {errors.sl && (
                            <span className={styles.fieldError}>
                                {errors.sl.message}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.inlineInfo}>
                    <span>Spread {spreadPts}pt</span>
                    <span>Slippage {slippagePts}pt</span>
                    <span>
                        Commission {currency}
                        {commission.toFixed(2)}
                    </span>
                </div>

                {errors.root && (
                    <div className={styles.error}>{errors.root.message}</div>
                )}

                <div className={styles.actions}>
                    <button
                        className={`${styles.btn} ${styles.buy}`}
                        onClick={handleSubmit(onBuy)}
                        disabled={isDisabled}
                    >
                        {isCreatingPosition ? "Creating..." : "Buy Market"}
                    </button>
                    <button
                        className={`${styles.btn} ${styles.sell}`}
                        onClick={handleSubmit(onSell)}
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
