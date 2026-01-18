import { Button } from "../../../../../../../components/Button";
import { CreateSubscriptionForm } from "../CreateSubscriptionForm";
import type { CreateSubscriptionRequest } from "@backtrade/types";
import styles from "./CreateSubscriptionSection.module.css";

/**
 * Create Subscription Section component props
 */
interface CreateSubscriptionSectionProps {
    /**
     * Whether the create form is visible
     */
    isCreating: boolean;

    /**
     * Plan options for select
     */
    planOptions: Array<{ value: string; label: string }>;

    /**
     * Whether the form is submitting
     */
    isLoading: boolean;

    /**
     * Whether the user already has an active subscription
     */
    hasActiveSubscription: boolean;

    /**
     * Handler to start creating
     */
    onStartCreate: () => void;

    /**
     * Handler to cancel creating
     */
    onCancelCreate: () => void;

    /**
     * Handler to submit the form
     */
    onSubmit: (data: CreateSubscriptionRequest) => void;

    /**
     * User ID for the form
     */
    userId: number;
}

/**
 * Create Subscription Section component
 *
 * Section containing the create subscription button and form.
 * Shows a warning when user already has an active subscription.
 */
export function CreateSubscriptionSection({
    isCreating,
    planOptions,
    isLoading,
    hasActiveSubscription,
    onStartCreate,
    onCancelCreate,
    onSubmit,
    userId,
}: CreateSubscriptionSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Create New Subscription</h3>
                {!isCreating && (
                    <div className={styles.headerActions}>
                        {hasActiveSubscription && (
                            <span className={styles.warningBadge}>
                                User has active subscription
                            </span>
                        )}
                        <Button
                            variant="primary"
                            size="small"
                            onClick={onStartCreate}
                        >
                            New Subscription
                        </Button>
                    </div>
                )}
            </div>

            {hasActiveSubscription && isCreating && (
                <div className={styles.warningNotice}>
                    <p className={styles.warningText}>
                        <strong>Warning:</strong> This user already has an
                        active subscription. Creating a new active subscription
                        will be blocked by the system. You may only create a
                        subscription with "canceled" status, or cancel the
                        existing subscription first.
                    </p>
                </div>
            )}

            {isCreating && (
                <CreateSubscriptionForm
                    planOptions={planOptions}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                    onCancel={onCancelCreate}
                    userId={userId}
                />
            )}
        </div>
    );
}
