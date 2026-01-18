import { Link } from "react-router-dom";
import styles from "./FormFooter.module.css";

interface FormFooterProps {
    /** The main link text (e.g., "New here? Create an account") */
    mainLinkText: string;
    /** The URL for the main link */
    mainLinkUrl: string;
    /** Whether to align footer items vertically */
    verticalLayout?: boolean;
}

/**
 * Form footer component
 *
 * Displays the main link and footer links (Terms, Privacy, EU-ready)
 */
export function FormFooter({
    mainLinkText,
    mainLinkUrl,
    verticalLayout = false,
}: FormFooterProps) {
    return (
        <div
            className={`${styles.formFooter} ${verticalLayout ? styles.vertical : ""}`}
        >
            <Link to={mainLinkUrl} className={styles.mainLink}>
                {mainLinkText}
            </Link>
            <div className={styles.footerLinks}>
                <Link to="/terms">Terms</Link>
                <span className={styles.separator}>•</span>
                <Link to="/privacy">Privacy</Link>
                <span className={styles.separator}>•</span>
                <span className={styles.euReady}>EU-ready</span>
            </div>
        </div>
    );
}
