import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDataset } from "../../../../api/hooks/requests/datasets";
import { type Timeframe } from "@backtrade/types";
import {
    CreateDatasetFormSchema,
    type DatasetFormState,
} from "../../../../types/forms";

/**
 * Hook for managing dataset creation form state and logic
 *
 * This hook handles:
 * - Form state management via react-hook-form
 * - Validation via zod
 * - Dataset creation API call
 *
 * @returns Object containing form state, handlers, and mutation
 */
export function useDatasetCreate() {
    const { error: apiError, isLoading, execute } = useCreateDataset();
    const [lastCreatedData, setLastCreatedData] = useState<Awaited<
        ReturnType<typeof execute>
    > | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DatasetFormState>({
        resolver: zodResolver(CreateDatasetFormSchema),
        defaultValues: {
            instrument_id: "",
            timeframe: "",
        },
    });

    /**
     * Handle form submission
     */
    const onSubmit = useCallback(
        async (data: DatasetFormState) => {
            try {
                const result = await execute({
                    instrument_id: Number(data.instrument_id),
                    timeframe: data.timeframe as Timeframe,
                });

                setLastCreatedData(result);
                return result;
            } catch {
                setLastCreatedData(null);
                return null;
            }
        },
        [execute]
    );

    /**
     * Reset form to initial state
     */
    const resetForm = useCallback(() => {
        reset({
            instrument_id: "",
            timeframe: "",
        });
        setLastCreatedData(null);
    }, [reset]);

    return {
        // Form methods
        control,
        errors,
        handleSubmit: handleSubmit(onSubmit),
        resetForm,

        // API state
        data: lastCreatedData,
        apiError,
        isLoading,

        // Export Controller for usage
        Controller,
    };
}
