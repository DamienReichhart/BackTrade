import type { Invoice } from "@backtrade/types";
import { InvoiceRow } from "./InvoiceRow";
import styles from "./InvoiceList.module.css";

interface InvoiceListProps {
    invoices: Invoice[];
}

/**
 * The invoices/billing-history section.
 */
export function InvoiceList({ invoices }: InvoiceListProps) {
    return (
        <section className={styles.section} aria-label="Invoices">
            <h2 className={styles.heading}>Invoices</h2>
            {invoices.length === 0 ? (
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
