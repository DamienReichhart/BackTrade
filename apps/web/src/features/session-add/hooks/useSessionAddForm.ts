import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateSessionRequest, Speed, Leverage } from "@backtrade/types";
import { useCreateSession } from "../../../api/hooks/requests/sessions";
import { useInstruments } from "../../../api/hooks/requests/instruments";
import { useAuthStore } from "../../../context/AuthContext";
import type { SelectOption } from "../../../types/ui";
import {
  validateInstrument,
  validateSpeed,
  validateInitialBalance,
  validateLeverage,
  validateNumericField,
  validateDateTimeField,
  formatLocalDateTimeToISO,
  validateStartTsVsEndTs,
} from "../utils";

/**
 * Speed options for the select dropdown
 */
const SPEED_OPTIONS: SelectOption[] = [
  { value: "0.5x", label: "0.5x" },
  { value: "1x", label: "1x" },
  { value: "2x", label: "2x" },
  { value: "3x", label: "3x" },
  { value: "5x", label: "5x" },
  { value: "10x", label: "10x" },
  { value: "15x", label: "15x" },
];

/**
 * Leverage options for the select dropdown
 */
const LEVERAGE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1x" },
  { value: "50", label: "50x" },
  { value: "100", label: "100x" },
  { value: "200", label: "200x" },
  { value: "500", label: "500x" },
  { value: "1000", label: "1000x" },
];

/**
 * Hook to manage session add form state and submission
 *
 * Each field has its own separate state for better isolation and control
 *
 * @returns Form state, handlers, and submission logic
 */
export function useSessionAddForm() {
  const navigate = useNavigate();
  const { execute, isLoading } = useCreateSession();
  const { user } = useAuthStore();
  const { data: instruments, isLoading: isLoadingInstruments } = useInstruments(
    {
      page: 1,
      limit: 100,
      order: "asc",
    },
  );

  // Separate state for each field
  const [instrumentId, setInstrumentId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [speed, setSpeed] = useState<string>("");
  const [startTs, setStartTs] = useState<string>("");
  // current_ts is automatically set to start_ts, not visible to user
  const [endTs, setEndTs] = useState<string>("");
  const [initialBalance, setInitialBalance] = useState<string>("");
  const [leverage, setLeverage] = useState<number | null>(null);
  const [spreadPts, setSpreadPts] = useState<string>("0");
  const [slippagePts, setSlippagePts] = useState<string>("0");
  const [commissionPerFill, setCommissionPerFill] = useState<string>("0");

  // Separate error state for each field
  const [instrumentIdError, setInstrumentIdError] = useState<
    string | undefined
  >(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [speedError, setSpeedError] = useState<string | undefined>(undefined);
  const [startTsError, setStartTsError] = useState<string | undefined>(
    undefined,
  );
  const [endTsError, setEndTsError] = useState<string | undefined>(undefined);
  const [initialBalanceError, setInitialBalanceError] = useState<
    string | undefined
  >(undefined);
  const [leverageError, setLeverageError] = useState<string | undefined>(
    undefined,
  );
  const [spreadPtsError, setSpreadPtsError] = useState<string | undefined>(
    undefined,
  );
  const [slippagePtsError, setSlippagePtsError] = useState<string | undefined>(
    undefined,
  );
  const [commissionPerFillError, setCommissionPerFillError] = useState<
    string | undefined
  >(undefined);

  /**
   * Convert instruments to select options
   */
  const instrumentOptions: SelectOption[] = useMemo(() => {
    if (!instruments) return [];
    return instruments
      .filter((instrument) => instrument.enabled)
      .map((instrument) => ({
        value: String(instrument.id),
        label: `${instrument.display_name} (${instrument.symbol})`,
      }));
  }, [instruments]);

  /**
   * Check if form is valid
   */
  const isFormValid = useMemo(() => {
    const hasRequiredFields =
      instrumentId !== null &&
      speed !== "" &&
      startTs !== "" &&
      initialBalance !== "" &&
      leverage !== null &&
      spreadPts !== "" &&
      slippagePts !== "" &&
      commissionPerFill !== "";

    const hasNoErrors =
      !instrumentIdError &&
      !speedError &&
      !startTsError &&
      !initialBalanceError &&
      !leverageError &&
      !spreadPtsError &&
      !slippagePtsError &&
      !commissionPerFillError;

    return hasRequiredFields && hasNoErrors;
  }, [
    instrumentId,
    speed,
    startTs,
    initialBalance,
    leverage,
    spreadPts,
    slippagePts,
    commissionPerFill,
    instrumentIdError,
    speedError,
    startTsError,
    initialBalanceError,
    leverageError,
    spreadPtsError,
    slippagePtsError,
    commissionPerFillError,
  ]);

  /**
   * Handle instrument change
   */
  const handleInstrumentChange = (value: string) => {
    const id = value ? parseInt(value, 10) : null;
    setInstrumentId(id);
    const error = validateInstrument(id);
    setInstrumentIdError(error);
  };

  /**
   * Handle name change
   */
  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(undefined);
  };

  /**
   * Handle speed change
   */
  const handleSpeedChange = (value: string) => {
    setSpeed(value);
    const error = validateSpeed(value);
    setSpeedError(error);
  };

  /**
   * Handle start timestamp change
   * current_ts is automatically set to start_ts
   */
  const handleStartTsChange = (value: string) => {
    setStartTs(value);
    const error = validateDateTimeField(value, "Start time");
    setStartTsError(error);

    // Validate end_ts against start_ts if end_ts is set
    if (endTs && !error) {
      const startDate = new Date(formatLocalDateTimeToISO(value));
      const endDate = new Date(formatLocalDateTimeToISO(endTs));
      if (endDate < startDate) {
        setEndTsError("End time must be after or equal to start time.");
      } else {
        setEndTsError(undefined);
      }
    }
  };

  /**
   * Handle end timestamp change
   * Validates against start_ts (since current_ts = start_ts)
   */
  const handleEndTsChange = (value: string) => {
    setEndTs(value);
    const error = validateDateTimeField(value, "End time", false);
    setEndTsError(error);

    // Validate against start_ts if both are set (since current_ts = start_ts)
    if (startTs && value && !error) {
      const endDate = new Date(formatLocalDateTimeToISO(value));
      const startDate = new Date(formatLocalDateTimeToISO(startTs));
      if (endDate < startDate) {
        setEndTsError("End time must be after or equal to start time.");
      } else {
        setEndTsError(undefined);
      }
    }
  };

  /**
   * Handle initial balance change
   */
  const handleInitialBalanceChange = (value: string) => {
    setInitialBalance(value);
    const error = validateInitialBalance(value);
    setInitialBalanceError(error);
  };

  /**
   * Handle leverage change
   */
  const handleLeverageChange = (value: string) => {
    const lev = value ? parseInt(value, 10) : null;
    setLeverage(lev);
    const error = validateLeverage(lev);
    setLeverageError(error);
  };

  /**
   * Handle spread points change
   */
  const handleSpreadPtsChange = (value: string) => {
    setSpreadPts(value);
    const error = validateNumericField(value, "Spread points");
    setSpreadPtsError(error);
  };

  /**
   * Handle slippage points change
   */
  const handleSlippagePtsChange = (value: string) => {
    setSlippagePts(value);
    const error = validateNumericField(value, "Slippage points");
    setSlippagePtsError(error);
  };

  /**
   * Handle commission per fill change
   */
  const handleCommissionPerFillChange = (value: string) => {
    setCommissionPerFill(value);
    const error = validateNumericField(value, "Commission per fill");
    setCommissionPerFillError(error);
  };

  /**
   * Handle form submission
   * Sets current_ts = start_ts automatically
   * Includes user_id from auth context
   * Sets session_status to PAUSED
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user?.id) {
      setInstrumentIdError("You must be logged in to create a session.");
      return;
    }

    // Validate all fields
    const instrumentErr = validateInstrument(instrumentId);
    const speedErr = validateSpeed(speed);
    const startTsErr = validateDateTimeField(startTs, "Start time");
    const endTsErr = validateDateTimeField(endTs, "End time", false);
    const initialBalanceErr = validateInitialBalance(initialBalance);
    const leverageErr = validateLeverage(leverage);
    const spreadPtsErr = validateNumericField(spreadPts, "Spread points");
    const slippagePtsErr = validateNumericField(slippagePts, "Slippage points");
    const commissionErr = validateNumericField(
      commissionPerFill,
      "Commission per fill",
    );
    const startTsVsEndTsErr = validateStartTsVsEndTs(startTs, endTs);
    // Set all errors
    setInstrumentIdError(instrumentErr);
    setSpeedError(speedErr);
    setStartTsError(startTsErr);
    setEndTsError(endTsErr);
    setInitialBalanceError(initialBalanceErr);
    setLeverageError(leverageErr);
    setSpreadPtsError(spreadPtsErr);
    setSlippagePtsError(slippagePtsErr);
    setCommissionPerFillError(commissionErr);

    // Check if there are any errors
    if (
      instrumentErr ||
      speedErr ||
      startTsErr ||
      initialBalanceErr ||
      leverageErr ||
      spreadPtsErr ||
      slippagePtsErr ||
      commissionErr ||
      startTsVsEndTsErr
    ) {
      return;
    }

    try {
      // current_ts is automatically set to start_ts
      const currentTsValue = startTs;

      // Get current timestamp in ISO format for created_at and updated_at
      const now = formatLocalDateTimeToISO(new Date().toISOString());

      // Build request payload
      // Include all required fields: user_id, session_status, created_at, updated_at
      const request: CreateSessionRequest = {
        instrument_id: instrumentId!,
        name: name || undefined,
        speed: speed as Speed,
        start_ts: formatLocalDateTimeToISO(startTs),
        current_ts: formatLocalDateTimeToISO(currentTsValue),
        end_ts: endTs ? formatLocalDateTimeToISO(endTs) : undefined,
        initial_balance: parseFloat(initialBalance),
        leverage: leverage! as Leverage,
        spread_pts: parseInt(spreadPts, 10),
        slippage_pts: parseInt(slippagePts, 10),
        commission_per_fill: parseFloat(commissionPerFill),
        // Include user_id from auth context
        user_id: user.id,
        // Set session_status to PAUSED
        session_status: "PAUSED",
        // Set created_at and updated_at to current time
        created_at: now,
        updated_at: now,
      };

      const result = await execute(request);

      // Navigate to the created session
      if (result) {
        navigate(`/dashboard/sessions/${result.id}`);
      }
    } catch (err) {
      // Handle error
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create session. Please try again.";
      setInstrumentIdError(errorMessage);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    navigate("/dashboard");
  };

  return {
    // Form state (current_ts is not exposed, it's auto-set to start_ts)
    formState: {
      instrument_id: instrumentId,
      name,
      speed,
      start_ts: startTs,
      end_ts: endTs,
      initial_balance: initialBalance,
      leverage,
      spread_pts: spreadPts,
      slippage_pts: slippagePts,
      commission_per_fill: commissionPerFill,
    },
    // Errors
    errors: {
      instrument_id: instrumentIdError,
      name: nameError,
      speed: speedError,
      start_ts: startTsError,
      end_ts: endTsError,
      initial_balance: initialBalanceError,
      leverage: leverageError,
      spread_pts: spreadPtsError,
      slippage_pts: slippagePtsError,
      commission_per_fill: commissionPerFillError,
    },
    isLoading,
    isFormValid,
    instrumentOptions,
    isLoadingInstruments,
    speedOptions: SPEED_OPTIONS,
    leverageOptions: LEVERAGE_OPTIONS,
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
  };
}
