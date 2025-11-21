import type { CreateSubscriptionRequest } from "@backtrade/types";
import { Button } from "../../../../../../../components/Button";
import { Input } from "../../../../../../../components/Input";
import { Select } from "../../../../../../../components/Select";
import { SUBSCRIPTION_STATUS_OPTIONS } from "../../hooks/useSubscriptionManagementModal";
import styles from "./CreateSubscriptionForm.module.css";

/**
 * Create Subscription Form component props
 */
interface CreateSubscriptionFormProps {
  /**
   * Form data
   */
  form: Partial<CreateSubscriptionRequest>;

  /**
   * Form update handler
   */
  onFormChange: (form: Partial<CreateSubscriptionRequest>) => void;

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
  onSubmit: () => void;

  /**
   * Form cancel handler
   */
  onCancel: () => void;
}

/**
 * Create Subscription Form component
 *
 * Form for creating a new subscription
 */
export function CreateSubscriptionForm({
  form,
  onFormChange,
  planOptions,
  isLoading,
  onSubmit,
  onCancel,
}: CreateSubscriptionFormProps) {
  const isFormValid =
    !!form.plan_id &&
    !!form.stripe_subscription_id &&
    !!form.current_period_start &&
    !!form.current_period_end &&
    new Date(form.current_period_start) < new Date(form.current_period_end);

  return (
    <div className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.label}>Plan</label>
          <Select
            value={form.plan_id?.toString() ?? ""}
            onChange={(value) =>
              onFormChange({ ...form, plan_id: parseInt(value, 10) })
            }
            options={planOptions}
            placeholder="Select plan"
            disabled={isLoading}
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Stripe Subscription ID</label>
          <Input
            type="text"
            value={form.stripe_subscription_id ?? ""}
            onChange={(e) =>
              onFormChange({
                ...form,
                stripe_subscription_id: e.target.value,
              })
            }
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.label}>Current Period Start</label>
          <Input
            type="datetime-local"
            value={
              form.current_period_start
                ? new Date(form.current_period_start).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              onFormChange({
                ...form,
                current_period_start: new Date(e.target.value).toISOString(),
              })
            }
            disabled={isLoading}
            required
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Current Period End</label>
          <Input
            type="datetime-local"
            value={
              form.current_period_end
                ? new Date(form.current_period_end).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              onFormChange({
                ...form,
                current_period_end: new Date(e.target.value).toISOString(),
              })
            }
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.label}>Status</label>
          <Select
            value={form.status ?? "active"}
            onChange={(value) =>
              onFormChange({
                ...form,
                status: value as CreateSubscriptionRequest["status"],
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
              checked={form.cancel_at_period_end ?? false}
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
          onClick={onSubmit}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Creating..." : "Create Subscription"}
        </Button>
      </div>
    </div>
  );
}
