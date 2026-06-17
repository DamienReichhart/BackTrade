import { useMemo } from "react";
import { useToastStore } from "../store/toast";

const ERROR_DURATION_MS = 6000;

/**
 * Hook exposing convenient toast helpers.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * toast.success("Password updated");
 * toast.error("Could not save changes");
 * ```
 */
export function useToast() {
    const addToast = useToastStore((state) => state.addToast);
    const removeToast = useToastStore((state) => state.removeToast);

    return useMemo(
        () => ({
            success: (message: string, duration?: number) =>
                addToast({ type: "success", message, duration }),
            error: (message: string, duration?: number) =>
                addToast({
                    type: "error",
                    message,
                    // Errors linger a little longer so they can be read.
                    duration: duration ?? ERROR_DURATION_MS,
                }),
            info: (message: string, duration?: number) =>
                addToast({ type: "info", message, duration }),
            warning: (message: string, duration?: number) =>
                addToast({ type: "warning", message, duration }),
            dismiss: removeToast,
        }),
        [addToast, removeToast]
    );
}
