import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    CreateInstrumentRequestSchema,
    UpdateInstrumentRequestSchema,
    type Instrument,
} from "@backtrade/types";
import {
    useCreateInstrument,
    useUpdateInstrument,
} from "../../../../api/hooks/requests/instruments";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import styles from "./InstrumentModal.module.css";

/**
 * Combined form schema that includes all fields needed for both create and update
 */
const InstrumentFormSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    display_name: z.string().min(1, "Display name is required"),
    pip_size: z.number().positive("Pip size must be positive"),
});

type InstrumentFormData = z.infer<typeof InstrumentFormSchema>;

interface InstrumentModalProps {
    instrument?: Instrument | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InstrumentModal({
    instrument,
    isOpen,
    onClose,
    onSuccess,
}: InstrumentModalProps) {
    const isEdit = !!instrument;

    // Create mutation
    const createMutation = useCreateInstrument();

    // Update mutation - ID is required for the hook, use "0" as fallback when no instrument selected
    const updateMutation = useUpdateInstrument(
        instrument?.id?.toString() ?? "0"
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<InstrumentFormData>({
        resolver: zodResolver(InstrumentFormSchema),
        defaultValues: {
            symbol: "",
            display_name: "",
            pip_size: 0.0001,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (instrument) {
                reset({
                    symbol: instrument.symbol,
                    display_name: instrument.display_name,
                    pip_size: instrument.pip_size,
                });
            } else {
                reset({
                    symbol: "",
                    display_name: "",
                    pip_size: 0.0001,
                });
            }
        }
    }, [isOpen, instrument, reset]);

    const onSubmit = async (data: InstrumentFormData) => {
        try {
            if (isEdit && instrument) {
                // Update - only send fields allowed by UpdateInstrumentRequestSchema
                const updateData = UpdateInstrumentRequestSchema.parse({
                    display_name: data.display_name,
                    pip_size: data.pip_size,
                });
                await updateMutation.execute(updateData);
            } else {
                // Create
                const createData = CreateInstrumentRequestSchema.parse({
                    symbol: data.symbol,
                    display_name: data.display_name,
                    pip_size: data.pip_size,
                });
                await createMutation.execute(createData);
            }
            onSuccess();
        } catch (err) {
            setError("root", {
                message:
                    err instanceof Error ? err.message : "An error occurred",
            });
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="instrument-modal-title"
            >
                <div className={styles.header}>
                    <h2 id="instrument-modal-title" className={styles.title}>
                        {isEdit ? "Edit Instrument" : "Create Instrument"}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.content}>
                        <Input
                            label="Symbol"
                            error={errors.symbol?.message}
                            hasError={!!errors.symbol}
                            disabled={isLoading || isEdit}
                            placeholder="EURUSD"
                            {...register("symbol")}
                        />

                        <Input
                            label="Display Name"
                            error={errors.display_name?.message}
                            hasError={!!errors.display_name}
                            disabled={isLoading}
                            placeholder="Euro vs US Dollar"
                            {...register("display_name")}
                        />

                        <Input
                            label="Pip Size"
                            type="number"
                            step="0.00001"
                            error={errors.pip_size?.message}
                            hasError={!!errors.pip_size}
                            disabled={isLoading}
                            placeholder="0.0001"
                            {...register("pip_size", { valueAsNumber: true })}
                        />

                        {errors.root && (
                            <div className={styles.submitError}>
                                {errors.root.message}
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={onClose}
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="medium"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Saving..."
                                : isEdit
                                  ? "Update Instrument"
                                  : "Create Instrument"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
