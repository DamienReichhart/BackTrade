import type { Dataset } from "@backtrade/types";
import { useMemo } from "react";
import { calculateDatasetStats } from "./utils";
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
    variant: "primary" | "success" | "warning" | "info";
}

/**
 * StatsCards component
 *
 * Displays summary statistics for datasets in a card grid
 */
export function StatsCards({ datasets, isLoading = false }: StatsCardsProps) {
    const stats = useMemo((): StatCard[] => {
        const {
            totalRegistered,
            withDataUploaded,
            awaitingUpload,
            totalDataPoints,
        } = calculateDatasetStats(datasets);

        const cards: StatCard[] = [
            {
                label: "Registered Datasets",
                value: totalRegistered,
                variant: "primary",
            },
            {
                label: "Data Points",
                value: totalDataPoints.toLocaleString(),
                variant: "info",
            },
        ];

        // Only show "Upload Complete" card if there are uploaded datasets
        if (withDataUploaded > 0) {
            cards.push({
                label: "Upload Complete",
                value: withDataUploaded,
                variant: "success",
            });
        }

        cards.push({
            label: "Awaiting Upload",
            value: awaitingUpload,
            variant: "warning",
        });

        return cards;
    }, [datasets]);

    if (isLoading) {
        return (
            <div className={styles.grid}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.cardSkeleton}>
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
                    <div className={styles.content}>
                        <span className={styles.value}>{stat.value}</span>
                        <span className={styles.label}>{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
