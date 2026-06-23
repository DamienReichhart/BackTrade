import { useCallback } from "react";
import { useResumeSubscription } from "../../../api/hooks/requests/stripe";
import { useToast } from "../../../hooks";

/**
 * Resume a subscription that is scheduled to cancel.
 */
export function useSubscriptionLifecycle(): {
    resume: () => Promise<void>;
    isResuming: boolean;
} {
    const { execute, isLoading } = useResumeSubscription();
    const toast = useToast();

    const resume = useCallback(async () => {
        try {
            await execute({});
            toast.success("Subscription resumed");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to resume subscription"
            );
        }
    }, [execute, toast]);

    return { resume, isResuming: isLoading };
}
