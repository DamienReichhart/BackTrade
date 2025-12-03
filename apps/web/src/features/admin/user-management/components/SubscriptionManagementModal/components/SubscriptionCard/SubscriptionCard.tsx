import type {
    Subscription,
    Plan,
    UpdateSubscriptionRequest,
} from "@backtrade/types";
import { Button } from "../../../../../../../components/Button";
import { formatDate } from "@backtrade/utils";
import { SubscriptionEditForm } from "../SubscriptionEditForm";
import styles from "./SubscriptionCard.module.css";

/**
 * Subscription Card component props
 */
interface SubscriptionCardProps {
    /**
     * Subscription to display
     */
    subscription: Subscription;

    /**
     * Plan associated with the subscription
     */
    plan: Plan | undefined;

    /**
     * Whether this subscription is being edited
     */
    isEditing: boolean;

    /**
     * Edit form data
     */
    editForm: Partial<UpdateSubscriptionRequest>;

    /**
     * Edit form update handler
     */
    onEditFormChange: (form: Partial<UpdateSubscriptionRequest>) => void;

    /**
     * Whether the update is loading
     */
    isUpdating: boolean;

    /**
     * Handler to start editing
     */
    onStartEdit: () => void;

    /**
     * Handler to cancel editing
     */
    onCancelEdit: () => void;

    /**
     * Handler to save changes
     */
    onSave: () => void;

    /**
     * Handler to delete subscription
     */
    onDelete: () => void;
}

/**
 * Subscription Card component
 *
 * Displays subscription information with edit and delete actions
 */
export function SubscriptionCard({
    subscription,
    plan,
    isEditing,
    editForm,
    onEditFormChange,
    isUpdating,
    onStartEdit,
    onCancelEdit,
    onSave,
    onDelete,
}: SubscriptionCardProps) {
    if (isEditing) {
        return (
            <div className={styles.card}>
                <SubscriptionEditForm
                    subscription={subscription}
                    form={editForm}
                    onFormChange={onEditFormChange}
                    isLoading={isUpdating}
                    onCancel={onCancelEdit}
                    onSave={onSave}
                />
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.subscriptionInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ID:</span>
                    <span className={styles.infoValue}>{subscription.id}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Plan:</span>
                    <span className={styles.infoValue}>
                        {plan
                            ? `${plan.code} (${plan.currency} ${plan.price})`
                            : `Plan ID: ${subscription.plan_id}`}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Status:</span>
                    <span
                        className={`${styles.statusBadge} ${
                            styles[`status-${subscription.status}`]
                        }`}
                    >
                        {subscription.status}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                        Stripe Subscription ID:
                    </span>
                    <span className={styles.infoValue}>
                        {subscription.stripe_subscription_id}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Period Start:</span>
                    <span className={styles.infoValue}>
                        {formatDate(subscription.current_period_start)}
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Period End:</span>
                    <span className={styles.infoValue}>
                        {formatDate(subscription.current_period_end)}
                    </span>
                </div>
                {subscription.cancel_at_period_end && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                            Cancel at Period End:
                        </span>
                        <span className={styles.infoValue}>Yes</span>
                    </div>
                )}
                {subscription.canceled_at && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Canceled At:</span>
                        <span className={styles.infoValue}>
                            {formatDate(subscription.canceled_at)}
                        </span>
                    </div>
                )}
                {subscription.trial_end && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Trial End:</span>
                        <span className={styles.infoValue}>
                            {formatDate(subscription.trial_end)}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.subscriptionActions}>
                <Button variant="ghost" size="small" onClick={onStartEdit}>
                    Edit
                </Button>
                <Button
                    variant="ghost"
                    size="small"
                    onClick={onDelete}
                    className={styles.deleteButton}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
