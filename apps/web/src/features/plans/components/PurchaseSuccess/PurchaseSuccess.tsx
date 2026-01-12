import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../components";
import { useAuthStore } from "../../../../store/auth";
import { useCheckoutSession } from "../../../../api/hooks/requests/stripe";
import styles from "./PurchaseSuccess.module.css";

/**
 * Purchase success page component
 *
 * Verifies the Stripe Checkout session and displays a success message.
 * Invalidates subscription queries to refresh the UI.
 */
export function PurchaseSuccess() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();

    // Get session_id from URL query params
    const sessionId = searchParams.get("session_id");

    // Verify checkout session via API
    const { data: session, isLoading, error } = useCheckoutSession(sessionId);

    // Invalidate subscription queries when session is complete
    useEffect(() => {
        if (session?.status === "complete" && user) {
            queryClient.invalidateQueries({
                queryKey: ["GET", "/subscriptions"],
            });
            queryClient.invalidateQueries({
                queryKey: ["GET", `/users/${user.id}/subscriptions`],
            });
        }
    }, [session, user, queryClient]);

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

    // No session ID in URL
    if (!sessionId) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.iconContainer}>
                        <svg
                            className={styles.errorIcon}
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
                                d="M15 9l-6 6M9 9l6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Invalid Session</h1>
                    <p className={styles.message}>
                        No checkout session found. Please try purchasing again.
                    </p>
                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleViewPlans}
                        >
                            View Plans
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <p className={styles.loadingText}>
                            Verifying your purchase...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error or incomplete session
    if (error || session?.status !== "complete") {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.iconContainer}>
                        <svg
                            className={styles.errorIcon}
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
                                d="M12 8v4M12 16h.01"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Something Went Wrong</h1>
                    <p className={styles.message}>
                        We couldn&apos;t verify your purchase. If you were
                        charged, your subscription will be activated shortly.
                        Please contact support if the issue persists.
                    </p>
                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleViewPlans}
                        >
                            View Plans
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

    // Success state
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
                    Thank you for your subscription. Your plan has been
                    activated and you now have access to all features.
                </p>

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
