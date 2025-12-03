import { StatusIndicator } from "../components";
import { ForgotPasswordInfoPanel, ForgotPasswordFormPanel } from "./components";
import styles from "./ForgotPassword.module.css";

/**
 * Forgot password page component
 *
 * Orchestrates the forgot password page layout with information panel and form panel
 */
export default function ForgotPassword() {
    return (
        <div className={styles.forgotPassword}>
            <StatusIndicator />

            <div className={styles.container}>
                <ForgotPasswordInfoPanel />
                <ForgotPasswordFormPanel />
            </div>
        </div>
    );
}
