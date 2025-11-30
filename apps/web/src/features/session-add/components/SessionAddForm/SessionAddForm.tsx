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
    formState,
    errors,
    isLoading,
    isFormValid,
    instrumentOptions,
    isLoadingInstruments,
    speedOptions,
    leverageOptions,
    handleInstrumentChange,
    handleNameChange,
    handleSpeedChange,
    handleStartTsChange,
    handleEndTsChange,
    handleInitialBalanceChange,
    handleLeverageChange,
    handleSpreadPtsChange,
    handleSlippagePtsChange,
    handleCommissionPerFillChange,
    handleSubmit,
    handleCancel,
  } = useSessionAddForm();

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Instrument Selection */}
        <div className={styles.field}>
          <label className={styles.label}>
            Instrument <span className={styles.required}>*</span>
          </label>
          <Select
            value={
              formState.instrument_id ? String(formState.instrument_id) : ""
            }
            options={instrumentOptions}
            onChange={handleInstrumentChange}
            placeholder={
              isLoadingInstruments
                ? "Loading instruments..."
                : "Select instrument"
            }
            disabled={isLoadingInstruments}
          />
          {errors.instrument_id && (
            <span className={styles.error}>{errors.instrument_id}</span>
          )}
        </div>

        {/* Session Name */}
        <div className={styles.field}>
          <Input
            label="Session Name (Optional)"
            type="text"
            placeholder="My Trading Session"
            value={formState.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            error={errors.name}
            hasError={!!errors.name}
          />
        </div>

        {/* Speed Selection */}
        <div className={styles.field}>
          <label className={styles.label}>
            Speed <span className={styles.required}>*</span>
          </label>
          <Select
            value={formState.speed || ""}
            options={speedOptions}
            onChange={handleSpeedChange}
            placeholder="Select speed"
          />
          {errors.speed && <span className={styles.error}>{errors.speed}</span>}
        </div>

        {/* Start Timestamp */}
        <div className={styles.field}>
          <Input
            label="Start Time *"
            type="datetime-local"
            value={formState.start_time || ""}
            onChange={(e) => handleStartTsChange(e.target.value)}
            error={errors.start_time}
            hasError={!!errors.start_time}
            required
          />
        </div>

        {/* End Timestamp (Optional) */}
        <div className={styles.field}>
          <Input
            label="End Time (Optional)"
            type="datetime-local"
            value={formState.end_time || ""}
            onChange={(e) => handleEndTsChange(e.target.value)}
            error={errors.end_time}
            hasError={!!errors.end_time}
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
            value={formState.initial_balance || ""}
            onChange={(e) => handleInitialBalanceChange(e.target.value)}
            error={errors.initial_balance}
            hasError={!!errors.initial_balance}
            required
          />
        </div>

        {/* Leverage Selection */}
        <div className={styles.field}>
          <label className={styles.label}>
            Leverage <span className={styles.required}>*</span>
          </label>
          <Select
            value={formState.leverage ? String(formState.leverage) : ""}
            options={leverageOptions}
            onChange={handleLeverageChange}
            placeholder="Select leverage"
          />
          {errors.leverage && (
            <span className={styles.error}>{errors.leverage}</span>
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
            value={formState.spread_pts || ""}
            onChange={(e) => handleSpreadPtsChange(e.target.value)}
            error={errors.spread_pts}
            hasError={!!errors.spread_pts}
            required
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
            value={formState.slippage_pts || ""}
            onChange={(e) => handleSlippagePtsChange(e.target.value)}
            error={errors.slippage_pts}
            hasError={!!errors.slippage_pts}
            required
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
            value={formState.commission_per_fill || ""}
            onChange={(e) => handleCommissionPerFillChange(e.target.value)}
            error={errors.commission_per_fill}
            hasError={!!errors.commission_per_fill}
            required
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
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create Session"}
          </Button>
        </div>
      </form>
    </div>
  );
}
