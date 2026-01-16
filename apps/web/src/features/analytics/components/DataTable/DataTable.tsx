import { type ReactNode } from "react";
import styles from "./DataTable.module.css";

/**
 * Column definition for DataTable
 */
interface Column<T> {
    /** Column header */
    header: string;
    /** Key to access data or render function */
    accessor: keyof T | ((row: T) => ReactNode);
    /** Column alignment */
    align?: "left" | "center" | "right";
    /** CSS class for cells in this column */
    className?: string;
}

/**
 * DataTable props interface
 */
interface DataTableProps<T> {
    /**
     * Column definitions
     */
    columns: Column<T>[];

    /**
     * Data rows
     */
    data: T[];

    /**
     * Unique key accessor for rows
     */
    keyAccessor: keyof T | ((row: T) => string | number);

    /**
     * Empty state message
     * @default "No data"
     */
    emptyMessage?: string;

    /**
     * Loading state
     */
    isLoading?: boolean;

    /**
     * Additional CSS class
     */
    className?: string;

    /**
     * Row click handler
     */
    onRowClick?: (row: T) => void;
}

/**
 * DataTable component for displaying tabular data
 *
 * Flexible table component with column definitions and styling
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { header: "ID", accessor: "id" },
 *     { header: "PnL", accessor: (row) => formatCurrency(row.pnl), className: styles.pnl }
 *   ]}
 *   data={trades}
 *   keyAccessor="id"
 * />
 * ```
 */
export function DataTable<T>({
    columns,
    data,
    keyAccessor,
    emptyMessage = "No data",
    isLoading = false,
    className,
    onRowClick,
}: DataTableProps<T>) {
    const getKey = (row: T): string | number => {
        if (typeof keyAccessor === "function") {
            return keyAccessor(row);
        }
        return String(row[keyAccessor]);
    };

    const getCellValue = (row: T, column: Column<T>): ReactNode => {
        if (typeof column.accessor === "function") {
            return column.accessor(row);
        }
        return String(row[column.accessor] ?? "");
    };

    const tableClasses = [styles.tableWrapper, className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={tableClasses}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={
                                    column.align
                                        ? styles[column.align]
                                        : undefined
                                }
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <tr>
                            <td
                                className={styles.empty}
                                colSpan={columns.length}
                            >
                                Loading…
                            </td>
                        </tr>
                    )}
                    {!isLoading && data.length === 0 && (
                        <tr>
                            <td
                                className={styles.empty}
                                colSpan={columns.length}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                    {!isLoading &&
                        data.map((row) => (
                            <tr
                                key={getKey(row)}
                                className={
                                    onRowClick ? styles.clickable : undefined
                                }
                                onClick={
                                    onRowClick
                                        ? () => onRowClick(row)
                                        : undefined
                                }
                            >
                                {columns.map((column, index) => (
                                    <td
                                        key={index}
                                        className={[
                                            column.align
                                                ? styles[column.align]
                                                : undefined,
                                            column.className,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {getCellValue(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
