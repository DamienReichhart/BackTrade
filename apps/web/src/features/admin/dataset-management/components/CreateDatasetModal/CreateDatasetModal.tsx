import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "../../../../../components/Button";
import { Icon } from "../../../../../components/Icon";
import { Select } from "../../../../../components/Select";
import { useDatasetCreate } from "../../hooks";
import { useInstruments } from "../../../../../api/hooks/requests/instruments";
import type { SelectOption } from "../../../../../types/ui";
import { getTimeframeOptions } from "@backtrade/types";
import styles from "./CreateDatasetModal.module.css";

/**
 * Create Dataset Modal component props
 */
interface CreateDatasetModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * Callback when modal should close
     */
    onClose: () => void;

    /**
     * Callback when dataset is successfully created
     */
    onSuccess?: () => void;
}

/**
 * Modal component for creating a new dataset
 *
 * Allows users to create a dataset record without uploading the file yet
 */
export function CreateDatasetModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateDatasetModalProps) {
    const {
        control,
        errors,
        isValid,
        isLoading,
        handleSubmit,
        resetForm,
        Controller,
    } = useDatasetCreate();

    // Fetch instruments
    const { data: instruments, isLoading: isLoadingInstruments } =
        useInstruments({
            page: 1,
            limit: 100,
            order: "asc",
        });

    // Use enum values from types package
    const timeframeOptions: SelectOption[] = getTimeframeOptions().map(
        (opt) => ({
            value: opt.value,
            label: `${opt.value} (${opt.label})`,
        })
    );

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

    if (!isOpen) return null;

    const onFormSubmit = async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        // handleSubmit returns undefined if validation fails, or the result of onSubmit if it succeeds
        const result = await handleSubmit(e);
        // Only proceed if validation passed (result is not undefined) and API call succeeded (result is not null)
        if (result !== undefined && result !== null) {
            onSuccess?.();
            resetForm();
            onClose();
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleCancel}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-dataset-title"
            >
                <div className={styles.header}>
                    <h2 id="create-dataset-title" className={styles.title}>
                        Create New Dataset
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={handleCancel}
                        aria-label="Close modal"
                        disabled={isLoading}
                    >
                        <Icon icon={X} size="md" />
                    </button>
                </div>

                <form onSubmit={onFormSubmit} className={styles.form}>
                    <div className={styles.content}>
                        <div className={styles.field}>
                            <label
                                htmlFor="instrument_id"
                                className={styles.label}
                            >
                                Instrument *
                            </label>
                            <Controller
                                name="instrument_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={instrumentOptions}
                                        placeholder={
                                            isLoadingInstruments
                                                ? "Loading instruments..."
                                                : "Select an instrument"
                                        }
                                        disabled={
                                            isLoading || isLoadingInstruments
                                        }
                                    />
                                )}
                            />
                            {errors.instrument_id && (
                                <span className={styles.error}>
                                    {errors.instrument_id.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="timeframe" className={styles.label}>
                                Timeframe *
                            </label>
                            <Controller
                                name="timeframe"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={timeframeOptions}
                                        placeholder="Select timeframe"
                                        disabled={isLoading}
                                    />
                                )}
                            />
                            {errors.timeframe && (
                                <span className={styles.error}>
                                    {errors.timeframe.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleCancel}
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="medium"
                            type="submit"
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? "Creating..." : "Create Dataset"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
