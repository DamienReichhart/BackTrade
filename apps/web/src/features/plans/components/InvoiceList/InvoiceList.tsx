import type { Invoice } from "@backtrade/types";
import { Skeleton } from "../../../../components/Skeleton";
import { InvoiceRow } from "./InvoiceRow";
import styles from "./InvoiceList.module.css";

interface InvoiceListProps {
    invoices: Invoice[];
    isLoading?: boolean;
    error?: Error | null;
}

/**
 * The invoices/billing-history section, with its own loading and error states.
 */
export function InvoiceList({
    invoices,
    isLoading = false,
    error = null,
}: InvoiceListProps) {
    return (
        <section className={styles.section} aria-label="Invoices">
            <h2 className={styles.heading}>Invoices</h2>
            {isLoading ? (
                <div className={styles.list}>
                    <Skeleton height={44} />
                    <Skeleton height={44} />
                </div>
            ) : error ? (
                <p className={styles.empty}>Couldn&apos;t load invoices.</p>
            ) : invoices.length === 0 ? (
                <p className={styles.empty}>No invoices yet</p>
            ) : (
                <div className={styles.list}>
                    {invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </section>
    );
}
