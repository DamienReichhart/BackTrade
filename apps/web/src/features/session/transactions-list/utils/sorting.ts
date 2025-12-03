import type { Transaction } from "@backtrade/types";

/**
 * Sortable field types for transactions
 */
export type TransactionSortField =
    | "id"
    | "transaction_type"
    | "amount"
    | "balance_after"
    | "created_at";

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Get the sortable value for a transaction field
 *
 * @param transaction - The transaction object
 * @param field - The field to extract
 * @returns The sortable value (number or string)
 */
function getSortValue(
    transaction: Transaction,
    field: TransactionSortField
): number | string {
    switch (field) {
        case "id":
            return transaction.id;
        case "transaction_type":
            return transaction.transaction_type;
        case "amount":
            return transaction.amount;
        case "balance_after":
            return transaction.balance_after;
        case "created_at":
            return transaction.created_at
                ? new Date(transaction.created_at).getTime()
                : Number.NEGATIVE_INFINITY;
        default:
            return 0;
    }
}

/**
 * Sort transactions by field and order
 *
 * @param transactions - Array of transactions to sort
 * @param sortField - Field to sort by
 * @param sortOrder - Sort order (asc or desc)
 * @returns Sorted array of transactions
 */
export function sortTransactions(
    transactions: Transaction[],
    sortField: TransactionSortField,
    sortOrder: SortOrder
): Transaction[] {
    const sorted = [...transactions];

    sorted.sort((a, b) => {
        const aValue = getSortValue(a, sortField);
        const bValue = getSortValue(b, sortField);

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    return sorted;
}
