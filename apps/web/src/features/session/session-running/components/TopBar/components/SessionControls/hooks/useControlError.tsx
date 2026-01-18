import { useState, useCallback } from "react";

/**
 * Hook to manage control error state
 *
 * @returns Error state and handlers
 */
export function useControlError() {
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const handleSuccess = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        handleError,
        handleSuccess,
    };
}
