import type { Subscription, UpdateSubscriptionRequest } from "@backtrade/types";
import { Button } from "../../../../../../../components/Button";
import { Select } from "../../../../../../../components/Select";
import { SUBSCRIPTION_STATUS_OPTIONS } from "../../hooks/useSubscriptionManagementModal";
import styles from "./SubscriptionEditForm.module.css";

/**
 * Subscription Edit Form component props
 */
interface SubscriptionEditFormProps {
    /**
     * Subscription being edited
     */
    subscription: Subscription;

    /**
     * Edit form data
     */
    form: Partial<UpdateSubscriptionRequest>;

    /**
     * Form update handler
     */
    onFormChange: (form: Partial<UpdateSubscriptionRequest>) => void;

    /**
     * Whether the form is submitting
     */
    isLoading: boolean;

    /**
     * Handler to cancel editing
     */
    onCancel: () => void;

    /**
     * Handler to save changes
     */
    onSave: () => void;
}

/**
 * Subscription Edit Form component
 *
 * Inline form for editing a subscription
 */
export function SubscriptionEditForm({
    subscription,
    form,
    onFormChange,
    isLoading,
    onCancel,
    onSave,
}: SubscriptionEditFormProps) {
    return (
        <div className={styles.editForm}>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label className={styles.label}>Status</label>
                    <Select
                        value={form.status ?? subscription.status}
                        onChange={(value) =>
                            onFormChange({
                                ...form,
                                status: value as UpdateSubscriptionRequest["status"],
                            })
                        }
                        options={SUBSCRIPTION_STATUS_OPTIONS}
                        disabled={isLoading}
                    />
                </div>
                <div className={styles.formField}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            checked={
                                form.cancel_at_period_end ??
                                subscription.cancel_at_period_end
                            }
                            onChange={(e) =>
                                onFormChange({
                                    ...form,
                                    cancel_at_period_end: e.target.checked,
                                })
                            }
                            disabled={isLoading}
                        />
                        Cancel at Period End
                    </label>
                </div>
            </div>

            <div className={styles.formActions}>
                <Button
                    variant="outline"
                    size="small"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    size="small"
                    onClick={onSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Updating..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
