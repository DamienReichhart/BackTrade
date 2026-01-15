import { useForm, type UseFormReturn, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormSchema, type OrderFormState } from "../../../../types/forms";

export type OrderFormReturn = UseFormReturn<
    OrderFormState,
    unknown,
    OrderFormState
>;

/**
 * Hook to manage order form state
 *
 * @param _pipSize - Pip size for the instrument (reserved for future use)
 * @returns Form state and actions
 */
export function useOrderForm(_pipSize: number = 1): OrderFormReturn {
    return useForm<OrderFormState, unknown, OrderFormState>({
        resolver: zodResolver(OrderFormSchema) as Resolver<
            OrderFormState,
            unknown,
            OrderFormState
        >,
        defaultValues: {
            qty: 1,
            tp: undefined,
            sl: undefined,
        },
        mode: "onChange",
    });
}
