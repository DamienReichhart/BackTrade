import type {
    Subscription,
    Plan,
    UpdateSubscriptionRequest,
} from "@backtrade/types";
import { SubscriptionCard } from "../SubscriptionCard";
import styles from "./SubscriptionListView.module.css";

/**
 * Subscription List View component props
 */
interface SubscriptionListViewProps {
    /**
     * List of subscriptions to display
     */
    subscriptions: Subscription[];

    /**
     * Whether data is loading
     */
    isLoading: boolean;

    /**
     * ID of subscription currently being edited
     */
    editingSubscriptionId: number | null;

    /**
     * Edit form data
     */
    editForm: Partial<UpdateSubscriptionRequest>;

    /**
     * Edit form update handler
     */
    onEditFormChange: (form: Partial<UpdateSubscriptionRequest>) => void;

    /**
     * Whether update is loading
     */
    isUpdating: boolean;

    /**
     * Plan lookup function
     */
    getPlanById: (planId: number) => Plan | undefined;

    /**
     * Handler to start editing a subscription
     */
    onStartEdit: (subscription: Subscription) => void;

    /**
     * Handler to cancel editing
     */
    onCancelEdit: () => void;

    /**
     * Handler to save changes
     */
    onSave: () => void;

    /**
     * Handler to delete a subscription
     */
    onDelete: (subscription: Subscription) => void;
}

/**
 * Subscription List View component
 *
 * Displays a list of subscriptions with loading and empty states
 */
export function SubscriptionListView({
    subscriptions,
    isLoading,
    editingSubscriptionId,
    editForm,
    onEditFormChange,
    isUpdating,
    getPlanById,
    onStartEdit,
    onCancelEdit,
    onSave,
    onDelete,
}: SubscriptionListViewProps) {
    if (isLoading) {
        return (
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Existing Subscriptions</h3>
                <div className={styles.loading}>Loading subscriptions...</div>
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Existing Subscriptions</h3>
                <div className={styles.empty}>No subscriptions found</div>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Existing Subscriptions</h3>
            <div className={styles.list}>
                {subscriptions.map((subscription) => {
                    const isEditing = editingSubscriptionId === subscription.id;
                    const plan = getPlanById(subscription.plan_id);

                    return (
                        <SubscriptionCard
                            key={subscription.id}
                            subscription={subscription}
                            plan={plan}
                            isEditing={isEditing}
                            editForm={editForm}
                            onEditFormChange={onEditFormChange}
                            isUpdating={isUpdating}
                            onStartEdit={() => onStartEdit(subscription)}
                            onCancelEdit={onCancelEdit}
                            onSave={onSave}
                            onDelete={() => onDelete(subscription)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
