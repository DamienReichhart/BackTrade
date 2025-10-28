import { SessionList } from "./components/SessionList";
import { DashboardHeader } from "./components/DashboardHeader";
import styles from "./Dashboard.module.css";

/**
 * Dashboard page component
 *
 * Main dashboard displaying trading sessions and overall statistics
 */
export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <DashboardHeader />
      <SessionList />
    </div>
  );
}

