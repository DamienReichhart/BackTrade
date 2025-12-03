import { useState } from "react";

/**
 * Order form state
 */
export interface OrderFormState {
    qty: number;
    tp: number | undefined;
    sl: number | undefined;
    error: string | null;
}

/**
 * Order form actions
 */
export interface OrderFormActions {
    setQty: (qty: number) => void;
    setTp: (tp: number | undefined) => void;
    setSl: (sl: number | undefined) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

/**
 * Hook to manage order form state
 *
 * @param _pipSize - Pip size for the instrument (reserved for future use)
 * @returns Form state and actions
 */
export function useOrderForm(
    _pipSize: number = 1
): OrderFormState & OrderFormActions {
    const [qty, setQty] = useState<number>(1);
    const [tp, setTp] = useState<number | undefined>(undefined);
    const [sl, setSl] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setQty(1);
        setTp(undefined);
        setSl(undefined);
        setError(null);
    };

    return {
        qty,
        tp,
        sl,
        error,
        setQty,
        setTp,
        setSl,
        setError,
        reset,
    };
}
