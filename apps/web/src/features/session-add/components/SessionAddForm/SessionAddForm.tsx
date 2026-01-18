import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { useSessionAddForm } from "../../hooks/useSessionAddForm";
import styles from "./SessionAddForm.module.css";

/**
 * Session Add Form component
 *
 * Form for creating a new trading session with all required fields
 */
export function SessionAddForm() {
    const {
        register,
        control,
        errors,
        isLoading,
        isValid,
        instrumentOptions,
        isLoadingInstruments,
        speedOptions,
        leverageOptions,
        handleSubmit,
        handleCancel,
        Controller,
    } = useSessionAddForm();

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* General Error */}
                {errors.root && (
                    <div className={styles.errorBanner}>
                        {errors.root.message}
                    </div>
                )}

                {/* Instrument Selection */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        Instrument <span className={styles.required}>*</span>
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
                                        : "Select instrument"
                                }
                                disabled={isLoadingInstruments}
                            />
                        )}
                    />
                    {errors.instrument_id && (
                        <span className={styles.error}>
                            {errors.instrument_id.message}
                        </span>
                    )}
                </div>

                {/* Session Name */}
                <div className={styles.field}>
                    <Input
                        label="Session Name (Optional)"
                        type="text"
                        placeholder="My Trading Session"
                        error={errors.name?.message}
                        hasError={!!errors.name}
                        {...register("name")}
                    />
                </div>

                {/* Speed Selection */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        Speed <span className={styles.required}>*</span>
                    </label>
                    <Controller
                        name="speed"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={speedOptions}
                                placeholder="Select speed"
                            />
                        )}
                    />
                    {errors.speed && (
                        <span className={styles.error}>
                            {errors.speed.message}
                        </span>
                    )}
                </div>

                {/* Start Timestamp */}
                <div className={styles.field}>
                    <Input
                        label="Start Time *"
                        type="datetime-local"
                        error={errors.start_time?.message}
                        hasError={!!errors.start_time}
                        required
                        {...register("start_time")}
                    />
                </div>

                {/* End Timestamp (Optional) */}
                <div className={styles.field}>
                    <Input
                        label="End Time (Optional)"
                        type="datetime-local"
                        error={errors.end_time?.message}
                        hasError={!!errors.end_time}
                        {...register("end_time")}
                    />
                </div>

                {/* Initial Balance */}
                <div className={styles.field}>
                    <Input
                        label="Initial Balance *"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="10000.00"
                        error={errors.initial_balance?.message}
                        hasError={!!errors.initial_balance}
                        required
                        {...register("initial_balance")}
                    />
                </div>

                {/* Leverage Selection */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        Leverage <span className={styles.required}>*</span>
                    </label>
                    <Controller
                        name="leverage"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={leverageOptions}
                                placeholder="Select leverage"
                            />
                        )}
                    />
                    {errors.leverage && (
                        <span className={styles.error}>
                            {errors.leverage.message}
                        </span>
                    )}
                </div>

                {/* Spread Points */}
                <div className={styles.field}>
                    <Input
                        label="Spread Points *"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        error={errors.spread_pts?.message}
                        hasError={!!errors.spread_pts}
                        required
                        {...register("spread_pts")}
                    />
                </div>

                {/* Slippage Points */}
                <div className={styles.field}>
                    <Input
                        label="Slippage Points *"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        error={errors.slippage_pts?.message}
                        hasError={!!errors.slippage_pts}
                        required
                        {...register("slippage_pts")}
                    />
                </div>

                {/* Commission Per Fill */}
                <div className={styles.field}>
                    <Input
                        label="Commission Per Fill *"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        error={errors.commission_per_fill?.message}
                        hasError={!!errors.commission_per_fill}
                        required
                        {...register("commission_per_fill")}
                    />
                </div>

                {/* Form Actions */}
                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? "Creating..." : "Create Session"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
