import { StatusIndicator, LoginInfoPanel, LoginFormPanel } from "./components";
import styles from "./Login.module.css";

/**
 * Login page component
 *
 * Orchestrates the login page layout with information panel and form panel
 */
export default function Login() {
  return (
    <div className={styles.login}>
      <StatusIndicator />
      
      <div className={styles.container}>
        <LoginInfoPanel />
        <LoginFormPanel />
      </div>
    </div>
  );
}
