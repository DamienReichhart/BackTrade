import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    type CreateSubscriptionRequest,
    getSubscriptionStatusOptions,
} from "@backtrade/types";
import { Button } from "../../../../../../../components/Button";
import { Input } from "../../../../../../../components/Input";
import { Select } from "../../../../../../../components/Select";
import {
    CreateSubscriptionFormSchema,
    type CreateSubscriptionFormState,
} from "../../../../../../../types/forms";
import styles from "./CreateSubscriptionForm.module.css";

/**
 * Create Subscription Form component props
 */
interface CreateSubscriptionFormProps {
    /**
     * Plan options for select
     */
    planOptions: Array<{ value: string; label: string }>;

    /**
     * Whether the form is submitting
     */
    isLoading: boolean;

    /**
     * Form submit handler
     */
    onSubmit: (data: CreateSubscriptionRequest) => void;

    /**
     * Form cancel handler
     */
    onCancel: () => void;

    /**
     * Initial user ID
     */
    userId: number;
}

/**
 * Create Subscription Form component
 *
 * Form for creating a new subscription
 */
export function CreateSubscriptionForm({
    planOptions,
    isLoading,
    onSubmit,
    onCancel,
    userId,
}: CreateSubscriptionFormProps) {
    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<CreateSubscriptionFormState>({
        resolver: zodResolver(CreateSubscriptionFormSchema),
        mode: "onChange",
        defaultValues: {
            plan_id: "",
            stripe_subscription_id: "",
            current_period_start: defaultStart,
            current_period_end: defaultEnd,
            status: "active",
            cancel_at_period_end: false,
        },
    });

    const onFormSubmit = (data: CreateSubscriptionFormState) => {
        // Transform form data to request format
        const request: CreateSubscriptionRequest = {
            user_id: userId,
            plan_id: parseInt(data.plan_id, 10),
            stripe_subscription_id: data.stripe_subscription_id,
            current_period_start: new Date(
                data.current_period_start
            ).toISOString(),
            current_period_end: new Date(data.current_period_end).toISOString(),
            status: data.status,
            cancel_at_period_end: data.cancel_at_period_end,
        };
        onSubmit(request);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label className={styles.label}>Plan</label>
                    <Controller
                        name="plan_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={planOptions}
                                placeholder="Select plan"
                                disabled={isLoading}
                            />
                        )}
                    />
                    {errors.plan_id && (
                        <span className={styles.error}>
                            {errors.plan_id.message}
                        </span>
                    )}
                </div>
                <div className={styles.formField}>
                    <label className={styles.label}>
                        Stripe Subscription ID
                    </label>
                    <Input
                        type="text"
                        disabled={isLoading}
                        error={errors.stripe_subscription_id?.message}
                        hasError={!!errors.stripe_subscription_id}
                        {...register("stripe_subscription_id")}
                    />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label className={styles.label}>Current Period Start</label>
                    <Input
                        type="datetime-local"
                        disabled={isLoading}
                        error={errors.current_period_start?.message}
                        hasError={!!errors.current_period_start}
                        {...register("current_period_start")}
                    />
                </div>
                <div className={styles.formField}>
                    <label className={styles.label}>Current Period End</label>
                    <Input
                        type="datetime-local"
                        disabled={isLoading}
                        error={errors.current_period_end?.message}
                        hasError={!!errors.current_period_end}
                        {...register("current_period_end")}
                    />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formField}>
                    <label className={styles.label}>Status</label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                value={field.value ?? "active"}
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
                    {isLoading ? "Creating..." : "Create Subscription"}
                </Button>
            </div>
        </form>
    );
}
