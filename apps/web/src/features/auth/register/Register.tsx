import { RegisterInfoPanel, RegisterFormPanel } from "./components";
import { StatusIndicator } from "../components/StatusIndicator";
import styles from "./Register.module.css";

/**
 * Register page component
 *
 * Orchestrates the registration page layout with information panel and form panel
 */
export function Register() {
    return (
        <div className={styles.register}>
            <StatusIndicator />

            <div className={styles.container}>
                <RegisterInfoPanel />
                <RegisterFormPanel />
            </div>
        </div>
    );
}
