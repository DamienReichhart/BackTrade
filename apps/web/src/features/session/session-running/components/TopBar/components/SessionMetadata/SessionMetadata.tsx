import { useNavigate } from "react-router-dom";
import styles from "./SessionMetadata.module.css";
import { useCurrentSessionStore } from "../../../../../../../store/session";
import { Button } from "../../../../../../../components";
import { formatMetadata } from "./utils";

/**
 * SessionMetadata component
 *
 * Displays session information including badges, title, and metadata
 */
export function SessionMetadata() {
    const navigate = useNavigate();
    const { currentSession, currentSessionInstrument } =
        useCurrentSessionStore();

    const name = currentSession?.name ?? "Session";
    const symbol = formatMetadata(currentSessionInstrument?.symbol);
    const status = formatMetadata(currentSession?.session_status);

    return (
        <div className={styles.metadata}>
            <div className={styles.badges}>
                <span className={styles.badge}>Session</span>
            </div>
            <h2 className={styles.title}>{name}</h2>
            <div className={styles.metaRow}>
                <span className={styles.metaBadge}>{symbol}</span>
                <span className={styles.metaBadge}>{status}</span>
            </div>
            <Button
                variant="outline"
                size="medium"
                onClick={() => navigate("/dashboard")}
                className={styles.backButton}
            >
                Back to app
            </Button>
        </div>
    );
}
