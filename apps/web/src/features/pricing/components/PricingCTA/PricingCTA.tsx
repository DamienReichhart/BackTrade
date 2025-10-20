import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button";
import styles from "./PricingCTA.module.css";

/**
 * PricingCTA component
 *
 * Final call-to-action section encouraging users to pick a plan
 */
export function PricingCTA() {
  const navigate = useNavigate();

  return (
    <section className={styles.pricingCTA}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Pick a plan and run.</h2>
          <p className={styles.description}>
            Start free. Upgrade when you need more parallel sessions.
          </p>

          <div className={styles.actions}>
            <Button variant="ghost" size="large" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate("/signup")}
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
