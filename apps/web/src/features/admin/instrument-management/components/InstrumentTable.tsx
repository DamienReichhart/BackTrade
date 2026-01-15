import type { Instrument } from "@backtrade/types";
import { Button } from "../../../../components/Button";
import styles from "./InstrumentTable.module.css";

interface InstrumentTableProps {
    instruments: Instrument[];
    isLoading?: boolean;
    error?: Error | null;
    onEdit: (instrument: Instrument) => void;
    onDelete: (instrument: Instrument) => void;
}

export function InstrumentTable({
    instruments,
    isLoading = false,
    error = null,
    onEdit,
    onDelete,
}: InstrumentTableProps) {
    return (
        <div className={styles.card}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Symbol</th>
                            <th>Display Name</th>
                            <th>Pip Size</th>
                            <th>Contract Size</th>
                            <th className={styles.actionsHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td className={styles.empty} colSpan={6}>
                                    Loading instruments...
                                </td>
                            </tr>
                        )}
                        {error && (
                            <tr>
                                <td className={styles.error} colSpan={6}>
                                    Error loading instruments: {error.message}
                                </td>
                            </tr>
                        )}
                        {!isLoading && !error && instruments.length === 0 && (
                            <tr>
                                <td className={styles.empty} colSpan={6}>
                                    No instruments found
                                </td>
                            </tr>
                        )}
                        {!isLoading &&
                            !error &&
                            instruments.map((instrument) => (
                                <tr key={instrument.id} className={styles.row}>
                                    <td>{instrument.id}</td>
                                    <td className={styles.symbolCell}>
                                        {instrument.symbol}
                                    </td>
                                    <td>{instrument.display_name}</td>
                                    <td>{instrument.pip_size}</td>
                                    <td>{instrument.contract_size}</td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                onClick={() =>
                                                    onEdit(instrument)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                onClick={() =>
                                                    onDelete(instrument)
                                                }
                                                className={styles.deleteButton}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
