import type { Invoice } from "@backtrade/types";
import { Badge, type BadgeVariant } from "../../../../../components/Badge";
import { formatMoney, formatPeriodDate } from "../../../utils";
import styles from "./InvoiceRow.module.css";

interface InvoiceRowProps {
    invoice: Invoice;
}

function invoiceBadgeVariant(status: string): BadgeVariant {
    if (status === "paid") return "success";
    if (status === "open") return "warning";
    if (status === "uncollectible" || status === "void") return "danger";
    return "neutral";
}

/**
 * A single invoice line: date, number, amount, status, and a PDF link.
 */
export function InvoiceRow({ invoice }: InvoiceRowProps) {
    const downloadUrl = invoice.pdfUrl ?? invoice.hostedUrl;
    return (
        <div className={styles.row}>
            <span className={styles.date}>
                {formatPeriodDate(invoice.date)}
            </span>
            <span className={styles.number}>{invoice.number ?? "—"}</span>
            <span className={styles.amount}>
                {formatMoney(invoice.amount, invoice.currency)}
            </span>
            <Badge variant={invoiceBadgeVariant(invoice.status)}>
                {invoice.status}
            </Badge>
            {downloadUrl ? (
                <a
                    className={styles.link}
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    PDF
                </a>
            ) : (
                <span className={styles.linkDisabled}>—</span>
            )}
        </div>
    );
}
