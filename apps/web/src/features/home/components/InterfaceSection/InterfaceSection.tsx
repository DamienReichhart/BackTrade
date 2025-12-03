import { ChartPreview } from "./ChartPreview";
import { InterfaceFeatures } from "./InterfaceFeatures";
import styles from "./InterfaceSection.module.css";

/**
 * InterfaceSection component
 *
 * Displays interface preview with chart and feature highlights
 */
export function InterfaceSection() {
    return (
        <section id="interface" className={styles.interfaceSection}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Interface</h2>
                    <div className={styles.tabs}>
                        <span className={styles.tab}>CANDLESTICK</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.tab}>TICKET</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.tab}>POSITIONS</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.tab}>REPORTS</span>
                    </div>
                </header>

                <div className={styles.content}>
                    <div className={styles.chartColumn}>
                        <ChartPreview />
                    </div>

                    <div className={styles.featuresColumn}>
                        <InterfaceFeatures />
                    </div>
                </div>
            </div>
        </section>
    );
}
