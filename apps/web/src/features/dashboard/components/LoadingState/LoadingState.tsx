import { Skeleton } from "../../../../components/Skeleton";
import styles from "./LoadingState.module.css";

const PLACEHOLDER_COUNT = 6;

/**
 * Loading state component
 *
 * Shows content-shaped skeleton cards while sessions are being fetched.
 */
export function LoadingState() {
    return (
        <div
            className={styles.grid}
            aria-busy="true"
            aria-label="Loading sessions"
        >
            {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Skeleton variant="text" width="55%" height={20} />
                        <Skeleton variant="rect" width={64} height={22} />
                    </div>
                    <Skeleton variant="text" width="35%" />
                    <Skeleton variant="rect" height={56} />
                    <Skeleton variant="text" width="70%" />
                </div>
            ))}
        </div>
    );
}
