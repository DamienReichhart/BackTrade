import { Button } from "../../../../components/Button";
import styles from "./CTASection.module.css";

/**
 * CTASection component
 * 
 * Call-to-action section to encourage user sign-up
 */
export function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <p className={styles.label}>START NOW</p>
            <h2 className={styles.title}>Trade the past. Learn faster.</h2>
            <p className={styles.description}>
              Create an account and launch your first session in minutes. Upgrade when you need more parallel runs.
            </p>
          </div>
          
          <div className={styles.actions}>
            <Button variant="ghost" size="large">
              View pricing
            </Button>
            <Button variant="primary" size="large">
              Start free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

