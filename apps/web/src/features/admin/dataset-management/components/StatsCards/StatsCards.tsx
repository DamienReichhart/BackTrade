import type { Dataset } from "@backtrade/types";
import { useMemo } from "react";
import styles from "./StatsCards.module.css";

/**
 * StatsCards component props
 */
interface StatsCardsProps {
    /**
     * List of datasets to calculate stats from
     */
    datasets: Dataset[];

    /**
     * Whether data is loading
     */
    isLoading?: boolean;
}

/**
 * Stats card data structure
 */
interface StatCard {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    variant: "primary" | "success" | "warning" | "info";
}

/**
 * SVG Icons for stats cards
 */
const Icons = {
    database: (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    ),
    chart: (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
        </svg>
    ),
    checkCircle: (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    ),
    clock: (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
};

/**
 * StatsCards component
 *
 * Displays summary statistics for datasets in a card grid
 */
export function StatsCards({ datasets, isLoading = false }: StatsCardsProps) {
    const stats = useMemo((): StatCard[] => {
        const totalDatasets = datasets.length;
        const uploadedDatasets = datasets.filter((d) => d.file_name).length;
        const pendingDatasets = totalDatasets - uploadedDatasets;
        const totalRecords = datasets.reduce(
            (acc, d) => acc + (d.records_count ?? 0),
            0
        );

        return [
            {
                label: "Total Datasets",
                value: totalDatasets,
                icon: Icons.database,
                variant: "primary",
            },
            {
                label: "Total Records",
                value: totalRecords.toLocaleString(),
                icon: Icons.chart,
                variant: "info",
            },
            {
                label: "Uploaded",
                value: uploadedDatasets,
                icon: Icons.checkCircle,
                variant: "success",
            },
            {
                label: "Pending Upload",
                value: pendingDatasets,
                icon: Icons.clock,
                variant: "warning",
            },
        ];
    }, [datasets]);

    if (isLoading) {
        return (
            <div className={styles.grid}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={styles.cardSkeleton}>
                        <div className={styles.skeletonIcon} />
                        <div className={styles.skeletonContent}>
                            <div className={styles.skeletonValue} />
                            <div className={styles.skeletonLabel} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`${styles.card} ${styles[stat.variant]}`}
                >
                    <span className={styles.icon}>{stat.icon}</span>
                    <div className={styles.content}>
                        <span className={styles.value}>{stat.value}</span>
                        <span className={styles.label}>{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
