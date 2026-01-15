import { useMemo } from "react";
import { useAnalyticsPage } from "./hooks";
import {
    AnalyticsHeader,
    SessionInfoSection,
    PerformanceSummary,
    EquityCurveSection,
    BreakdownsSection,
    TradesSection,
} from "./components";
import { calculateStreaks } from "./utils";
import styles from "./AnalyticsPage.module.css";

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
    return (
        <div className={styles.page}>
            <div className={styles.skeleton}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonGrid}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
                <div className={styles.skeletonChart} />
            </div>
        </div>
    );
}

/**
 * Error state component
 */
function ErrorState({ message }: { message: string }) {
    return (
        <div className={styles.page}>
            <div className={styles.errorState}>
                <div className={styles.errorIcon}>!</div>
                <h2 className={styles.errorTitle}>Error Loading Analytics</h2>
                <p className={styles.errorMessage}>{message}</p>
            </div>
        </div>
    );
}

/**
 * Analytics Page Component
 *
 * Displays comprehensive analytics for a trading session including:
 * - Performance summary with key metrics
 * - Equity curve visualization
 * - Trade breakdowns by side
 * - Top/worst trades tables
 * - Daily PnL breakdown
 */
export default function AnalyticsPage() {
    const {
        analytics,
        session,
        isLoading,
        error,
        handleBackClick,
        handleExportPdf,
        handleExportCsv,
    } = useAnalyticsPage();

    // Calculate streaks from all positions
    const streaks = useMemo(() => {
        if (!analytics) return undefined;
        const allPositions = [
            ...analytics.top_winners,
            ...analytics.worst_losers,
        ];
        return calculateStreaks(allPositions);
    }, [analytics]);

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (error) {
        return <ErrorState message={error.message} />;
    }

    // No data state
    if (!analytics) {
        return <ErrorState message="No analytics data available" />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <AnalyticsHeader
                    session={session}
                    onBackClick={handleBackClick}
                    onExportPdf={handleExportPdf}
                    onExportCsv={handleExportCsv}
                />

                {/* Session Info */}
                <SessionInfoSection session={session} />

                {/* Performance Summary */}
                <PerformanceSummary summary={analytics.summary} />

                {/* Main Content Grid */}
                <div className={styles.mainGrid}>
                    {/* Equity Curve */}
                    <div className={styles.chartSection}>
                        <EquityCurveSection
                            equityCurve={analytics.equity_curve}
                            summary={analytics.summary}
                            streaks={streaks}
                        />
                    </div>

                    {/* Breakdowns */}
                    <div className={styles.breakdownsSection}>
                        <BreakdownsSection
                            breakdowns={analytics.breakdowns}
                            costs={analytics.costs}
                        />
                    </div>
                </div>

                {/* Trades Tables */}
                <TradesSection
                    topWinners={analytics.top_winners}
                    worstLosers={analytics.worst_losers}
                    dailyPnl={analytics.daily_pnl}
                />
            </div>
        </div>
    );
}
