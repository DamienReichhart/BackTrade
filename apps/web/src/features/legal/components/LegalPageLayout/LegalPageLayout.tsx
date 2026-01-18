import styles from "./LegalPageLayout.module.css";

/**
 * Legal page layout props interface
 */
interface LegalPageLayoutProps {
    /**
     * Page title
     */
    title: string;

    /**
     * Last updated date
     */
    lastUpdated: string;

    /**
     * Page content
     */
    children: React.ReactNode;
}

/**
 * Legal page layout component
 *
 * Provides consistent layout and styling for legal pages like Terms and Privacy Policy
 */
export function LegalPageLayout({
    title,
    lastUpdated,
    children,
}: LegalPageLayoutProps) {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.lastUpdated}>
                        Last updated: {lastUpdated}
                    </p>
                </header>

                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
