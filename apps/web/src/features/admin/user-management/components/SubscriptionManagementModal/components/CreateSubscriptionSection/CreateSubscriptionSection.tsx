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
     * Create form data
     */
    createForm: Partial<CreateSubscriptionRequest>;

    /**
     * Create form update handler
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
    onSubmit: () => void;
}

/**
 * Create Subscription Section component
 *
 * Section containing the create subscription button and form
 */
export function CreateSubscriptionSection({
    isCreating,
    createForm,
    onFormChange,
    planOptions,
    isLoading,
    onStartCreate,
    onCancelCreate,
    onSubmit,
}: CreateSubscriptionSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Create New Subscription</h3>
                {!isCreating && (
                    <Button
                        variant="primary"
                        size="small"
                        onClick={onStartCreate}
                    >
                        New Subscription
                    </Button>
                )}
            </div>

            {isCreating && (
                <CreateSubscriptionForm
                    form={createForm}
                    onFormChange={onFormChange}
                    planOptions={planOptions}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                    onCancel={onCancelCreate}
                />
            )}
        </div>
    );
}
