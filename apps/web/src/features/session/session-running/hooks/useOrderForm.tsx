import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormSchema, type OrderFormState } from "../../../../types/forms";

export type OrderFormReturn = UseFormReturn<OrderFormState>;

/**
 * Hook to manage order form state
 *
 * @param _pipSize - Pip size for the instrument (reserved for future use)
 * @returns Form state and actions
 */
export function useOrderForm(_pipSize: number = 1): OrderFormReturn {
    return useForm<OrderFormState>({
        resolver: zodResolver(OrderFormSchema),
        defaultValues: {
            qty: 1,
            tp: undefined,
            sl: undefined,
        },
        mode: "onChange",
    });
}
