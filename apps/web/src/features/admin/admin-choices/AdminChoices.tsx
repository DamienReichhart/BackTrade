import styles from "./Admin.module.css";
import { useAdminChoices } from "./hooks";

/**
 * Admin page component
 *
 * Main admin page with menu to choose between user management and data management
 */
export function AdminChoices() {
    const { handleMenuClick } = useAdminChoices();

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>Admin</h1>
            </header>

            {/* Menu Section */}
            <div className={styles.content}>
                <div className={styles.menu}>
                    <button
                        className={styles.menuItem}
                        onClick={() => handleMenuClick("user-management")}
                    >
                        <span className={styles.menuItemLabel}>
                            User Management
                        </span>
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => handleMenuClick("dataset-management")}
                    >
                        <span className={styles.menuItemLabel}>
                            Data Management
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
