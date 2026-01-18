import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    type Subscription,
    type UpdateSubscriptionRequest,
    getSubscriptionStatusOptions,
} from "@backtrade/types";
import { Button } from "../../../../../../../components/Button";
import { Select } from "../../../../../../../components/Select";
import {
    SubscriptionEditFormSchema,
    type SubscriptionEditFormState,
} from "../../../../../../../types/forms";
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
    onSave: (data: UpdateSubscriptionRequest) => void;
}

/**
 * Subscription Edit Form component
 *
 * Inline form for editing a subscription
 */
export function SubscriptionEditForm({
    subscription,
    isLoading,
    onCancel,
    onSave,
}: SubscriptionEditFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<SubscriptionEditFormState>({
        resolver: zodResolver(SubscriptionEditFormSchema),
        mode: "onChange",
        defaultValues: {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSave)} className={styles.editForm}>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label className={styles.label}>Status</label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                value={field.value ?? subscription.status}
                                options={getSubscriptionStatusOptions()}
                                disabled={isLoading}
                            />
                        )}
                    />
                </div>
                <div className={styles.formField}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            disabled={isLoading}
                            {...register("cancel_at_period_end")}
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
                    type="button"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    size="small"
                    type="submit"
                    disabled={isLoading || !isValid}
                >
                    {isLoading ? "Updating..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
