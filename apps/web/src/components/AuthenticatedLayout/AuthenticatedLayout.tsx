import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../context/AuthContext";
import { Button } from "../Button";
import styles from "./AuthenticatedLayout.module.css";
import logoSvg from "../../assets/logo.svg";

interface NavItem {
  label: string;
  to: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Admin", to: "/dashboard/admin" },
  { label: "Plans", to: "/dashboard/plans" },
  { label: "Settings", to: "/dashboard/settings" },
];

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Authenticated layout component
 *
 * Provides the sidebar navigation and main content area for authenticated pages
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
