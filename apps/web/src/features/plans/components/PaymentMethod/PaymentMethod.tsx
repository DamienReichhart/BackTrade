import type { BillingPaymentMethod } from "@backtrade/types";
import { Button } from "../../../../components/Button";
import styles from "./PaymentMethod.module.css";

interface PaymentMethodProps {
    paymentMethod: BillingPaymentMethod | null;
    onManage: () => void;
    disabled: boolean;
}

function titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Shows the card on file; editing happens in the Stripe portal.
 */
export function PaymentMethod({
    paymentMethod,
    onManage,
    disabled,
}: PaymentMethodProps) {
    return (
        <section className={styles.section} aria-label="Payment method">
            <h2 className={styles.heading}>Payment method</h2>
            <div className={styles.card}>
                {paymentMethod ? (
                    <span className={styles.details}>
                        {titleCase(paymentMethod.brand)} ····{" "}
                        {paymentMethod.last4}
                        <span className={styles.expiry}>
                            Expires {paymentMethod.expMonth}/
                            {paymentMethod.expYear}
                        </span>
                    </span>
                ) : (
                    <span className={styles.empty}>
                        No payment method on file
                    </span>
                )}
                <Button
                    variant="outline"
                    size="small"
                    onClick={onManage}
                    disabled={disabled}
                >
                    {paymentMethod
                        ? "Update payment method"
                        : "Add payment method"}
                </Button>
            </div>
        </section>
    );
}
