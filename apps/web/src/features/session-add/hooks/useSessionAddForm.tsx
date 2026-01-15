import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    type CreateSessionRequest,
    type Speed,
    type Leverage,
    SESSION_STATUS,
    getSpeedOptions,
    getLeverageOptions,
} from "@backtrade/types";
import { useCreateSession } from "../../../api/hooks/requests/sessions";
import { useInstruments } from "../../../api/hooks/requests/instruments";
import { useAuthStore } from "../../../store/auth";
import type { SelectOption } from "../../../types/ui";
import { formatLocalDateTimeToISO } from "../utils/validation";
import {
    SessionAddFormSchema,
    type SessionAddFormState,
} from "../../../types/forms";

/**
 * Hook to manage session add form state and submission
 */
export function useSessionAddForm() {
    const navigate = useNavigate();
    const { execute, isLoading } = useCreateSession();
    const { user } = useAuthStore();
    const { data: instruments, isLoading: isLoadingInstruments } =
        useInstruments({
            page: 1,
            limit: 100,
            order: "asc",
        });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid },
        setError,
    } = useForm<SessionAddFormState>({
        resolver: zodResolver(SessionAddFormSchema),
        mode: "onChange",
        defaultValues: {
            instrument_id: "",
            name: "",
            speed: "",
            start_time: "",
            end_time: undefined,
            initial_balance: "",
            leverage: "",
            spread_pts: "0",
            slippage_pts: "0",
            commission_per_fill: "0",
        },
    });

    /**
     * Convert instruments to select options
     */
    const instrumentOptions: SelectOption[] = useMemo(() => {
        if (!instruments) return [];
        return instruments.map((instrument) => ({
            value: String(instrument.id),
            label: `${instrument.display_name} (${instrument.symbol})`,
        }));
    }, [instruments]);

    /**
     * Handle form submission
     */
    const onSubmit = async (data: SessionAddFormState) => {
        // Check if user is authenticated
        if (!user?.id) {
            setError("instrument_id", {
                type: "manual",
                message: "You must be logged in to create a session.",
            });
            return;
        }

        try {
            // Build request payload
            const request: CreateSessionRequest = {
                instrument_id: parseInt(data.instrument_id, 10),
                name: data.name ?? undefined,
                speed: data.speed as Speed,
                start_time: formatLocalDateTimeToISO(data.start_time),
                current_time: formatLocalDateTimeToISO(data.start_time), // Set current_time = start_time
                end_time: data.end_time
                    ? formatLocalDateTimeToISO(data.end_time)
                    : undefined,
                initial_balance: parseFloat(data.initial_balance),
                leverage: parseInt(data.leverage, 10) as Leverage,
                spread_pts: parseInt(data.spread_pts, 10),
                slippage_pts: parseInt(data.slippage_pts, 10),
                commission_per_fill: parseFloat(data.commission_per_fill),
                session_status: SESSION_STATUS.PAUSED,
            };

            const result = await execute(request);

            // Navigate to the created session
            if (result?.id) {
                navigate(`/dashboard/sessions/${result.id}`);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to create session. Please try again.";

            // Set a root error or attach to a specific field if applicable
            // For now, attaching to instrument_id as a general error location or using a dedicated error state
            setError("root", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    /**
     * Handle cancel action
     */
    const handleCancel = () => {
        navigate("/dashboard");
    };

    return {
        register,
        control,
        errors,
        isLoading,
        isValid,
        instrumentOptions,
        isLoadingInstruments,
        speedOptions: getSpeedOptions(),
        leverageOptions: getLeverageOptions(),
        handleSubmit: handleSubmit(onSubmit),
        handleCancel,
        Controller, // Export Controller for use in the component
    };
}
