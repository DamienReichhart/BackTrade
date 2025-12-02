import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useLogout } from "../../api/hooks/requests/auth";
import { Button } from "../Button";
import styles from "./AuthenticatedLayout.module.css";
import logoPng from "../../../assets/logo.png";

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
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const { execute: logoutApi } = useLogout();

    const handleLogout = async () => {
        try {
            // Call logout API endpoint
            await logoutApi({});
        } catch {
            // Do nothing
        } finally {
            // Always clear local state and navigate
            logout();
            navigate("/");
        }
    };

    // Filter nav items based on user role - hide Admin section for non-admin users
    const filteredNavItems = navItems.filter((item) => {
        if (item.label === "Admin") {
            return user?.role === "ADMIN";
        }
        return true;
    });

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.content}>
                    {/* Logo */}
                    <div className={styles.logoSection}>
                        <img
                            src={logoPng}
                            alt="BackTrade"
                            className={styles.logo}
                        />
                        <span className={styles.brandName}>BackTrade</span>
                    </div>

                    {/* Navigation */}
                    <nav className={styles.navigation}>
                        <ul className={styles.navList}>
                            {filteredNavItems.map((item) => {
                                const isActive = location.pathname === item.to;
                                return (
                                    <li
                                        key={item.label}
                                        className={styles.navItem}
                                    >
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
                            onClick={handleLogout}
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
