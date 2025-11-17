import { TopBar } from "./components/TopBar";
import { SidePanel } from "./components/SidePanel";
import { PositionsTable } from "./components/PositionsTable";
import { TransactionsTable } from "./components/TransactionsTable";
import { SessionInfo } from "./components/SessionInfo";
import { RunningSessionChart } from "./components/RunningSessionChart";
import { useSessionData } from "./hooks";
import styles from "./SessionRunning.module.css";

/**
 * Running Session page
 *
 * The layout strictly follows the mockup: header controls, main chart area,
 * order/estimates panel on the right, and tables below.
 */
export function SessionRunning() {
  useSessionData();

  return (
    <div className={styles.page}>
      <TopBar />

      <div className={styles.content}>
        {/* Chart */}
        <div className={styles.chartPlaceholderWrapper}>
          <RunningSessionChart />
        </div>

        {/* Order ticket */}
        <div className={styles.orderTicketWrapper}>
          <SidePanel />
        </div>

        {/* Tables */}
        <div className={styles.tablesRow}>
          <PositionsTable />
          <TransactionsTable />
        </div>

        {/* Session Info */}
        <div className={styles.sessionInfoWrapper}>
          <SessionInfo />
        </div>
      </div>
    </div>
  );
}
