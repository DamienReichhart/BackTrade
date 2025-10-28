import { DashboardSidebar } from "../DashboardSidebar";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component
 *
 * Provides the sidebar navigation and main content area for the dashboard
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

