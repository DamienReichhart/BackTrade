import { useQueryClient } from "@tanstack/react-query";
import type { CreatePositionRequest } from "@backtrade/types";
import { useCreatePosition } from "../../../../api/hooks/requests/positions";
import {
    useCurrentPriceStore,
    useCurrentSessionStore,
} from "../../../../store/session";
import type { OrderFormReturn } from "./useOrderForm";
import type { OrderFormState } from "../../../../types/forms";

/**
 * Hook to handle position creation logic
 *
 * @param form - Order form handle
 * @returns Position creation function and loading state
 */
export function usePositionCreation(form: OrderFormReturn) {
    const queryClient = useQueryClient();
    const { currentPrice } = useCurrentPriceStore();
    const { currentSession } = useCurrentSessionStore();
    const { execute: createPosition, isLoading: isCreatingPosition } =
        useCreatePosition();

    /**
     * Create a position with the given side
     */
    const createPositionWithSide = async (
        side: "BUY" | "SELL",
        data: OrderFormState
    ): Promise<void> => {
        form.clearErrors("root");

        if (!currentSession?.id) {
            form.setError("root", {
                type: "manual",
                message: "Session is required",
            });
            return;
        }

        if (!currentPrice) {
            form.setError("root", {
                type: "manual",
                message: "Current price is not available",
            });
            return;
        }

        if (!currentSession.current_time) {
            form.setError("root", {
                type: "manual",
                message: "Session timestamp is not available",
            });
            return;
        }

        try {
            const request: CreatePositionRequest = {
                session_id: currentSession.id,
                side,
                entry_price: currentPrice,
                quantity_lots: data.qty,
                position_status: "OPEN",
                opened_at: currentSession.current_time,
                ...(data.tp !== undefined && data.tp > 0
                    ? { tp_price: data.tp }
                    : {}),
                ...(data.sl !== undefined && data.sl > 0
                    ? { sl_price: data.sl }
                    : {}),
            };

            await createPosition(request);

            // Invalidate positions and transactions queries to refresh the tables
            const sessionId = String(currentSession.id);
            queryClient.invalidateQueries({
                queryKey: ["GET", `/sessions/${sessionId}/positions`],
            });
            queryClient.invalidateQueries({
                queryKey: ["GET", `/sessions/${sessionId}/transactions`],
            });
            queryClient.invalidateQueries({
                queryKey: ["GET", `/sessions/${sessionId}`],
            });

            // Optionally reset form but keep quantity? Or just keep as is.
            // form.reset();
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create position";
            form.setError("root", { type: "manual", message: errorMessage });
        }
    };

    return {
        createPositionWithSide,
        isCreatingPosition,
    };
}
