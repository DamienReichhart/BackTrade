import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../../components";
import type { Plan } from "@backtrade/types";
import styles from "./PurchaseSuccess.module.css";

/**
 * Purchase success page component
 *
 * Displays a success message after a user successfully purchases a plan
 */
export function PurchaseSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get plan information from location state
    const plan = location.state?.plan as Plan | undefined;
    const planCode = plan?.code ?? "PLAN";

    /**
     * Handle navigation to plans page
     */
    const handleViewPlans = () => {
        navigate("/dashboard/plans");
    };

    /**
     * Handle navigation to dashboard
     */
    const handleGoToDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconContainer}>
                    <svg
                        className={styles.checkIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M8 12l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <h1 className={styles.title}>Purchase Successful!</h1>

                <p className={styles.message}>
                    Your subscription to the{" "}
                    <strong>{planCode.toUpperCase()}</strong> plan has been
                    activated successfully.
                </p>

                {plan?.currency && plan.price !== undefined && (
                    <div className={styles.planInfo}>
                        <div className={styles.planDetail}>
                            <span className={styles.planLabel}>Plan:</span>
                            <span className={styles.planValue}>
                                {planCode.toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.planDetail}>
                            <span className={styles.planLabel}>Price:</span>
                            <span className={styles.planValue}>
                                {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: plan.currency,
                                }).format(plan.price)}
                                /month
                            </span>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        size="large"
                        onClick={handleViewPlans}
                    >
                        View My Plans
                    </Button>
                    <Button
                        variant="outline"
                        size="large"
                        onClick={handleGoToDashboard}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
