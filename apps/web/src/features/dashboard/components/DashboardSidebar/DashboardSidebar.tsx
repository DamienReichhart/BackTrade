import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../../context/AuthContext";
import { Button } from "../../../../components/Button";
import styles from "./DashboardSidebar.module.css";
import logoSvg from "../../../../assets/logo.svg";

interface NavItem {
  label: string;
  to: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Sessions", to: "/dashboard/sessions" },
  { label: "Reports", to: "/dashboard/reports" },
  { label: "Settings", to: "/dashboard/settings" },
];

/**
 * Dashboard sidebar component
 *
 * Provides navigation menu for the dashboard
 */
export function DashboardSidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <img src={logoSvg} alt="BackTrade" className={styles.logo} />
          <span className={styles.brandName}>BackTrade</span>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.label} className={styles.navItem}>
                  <Link
                    to={item.to}
                    className={`${styles.navLink} ${
                      isActive ? styles.active : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Actions */}
        <div className={styles.footer}>
          <Button
            variant="ghost"
            size="medium"
            onClick={logout}
            className={styles.logoutButton}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

