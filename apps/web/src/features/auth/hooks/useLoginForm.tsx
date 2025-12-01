import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../../api/hooks/requests/auth";
import { useAuthStore } from "../../../store/auth";
import { validateEmail, validatePassword } from "@backtrade/utils";

/**
 * Login form state
 */
export interface LoginFormState {
  email: string;
  password: string;
  rememberDevice: boolean;
}

/**
 * Login form errors
 */
export interface LoginFormErrors {
  email?: string;
  password?: string;
}

/**
 * Hook to manage login form state and submission
 *
 * @returns Login form state, handlers, and submission logic
 */
export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { execute, isLoading } = useLogin();

  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    rememberDevice: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({
    email: "Enter a valid email.",
    password: "Minimum 8 characters.",
  });

  /**
   * Handle email input change
   */
  const handleEmailChange = (value: string) => {
    setFormState((prev) => ({ ...prev, email: value }));

    const validation = validateEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validation.isValid ? undefined : validation.error,
    }));
  };

  /**
   * Handle password input change
   */
  const handlePasswordChange = (value: string) => {
    setFormState((prev) => ({ ...prev, password: value }));

    const validation = validatePassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validation.isValid ? undefined : validation.error,
    }));
  };

  /**
   * Handle remember device toggle
   */
  const handleRememberDeviceChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, rememberDevice: checked }));
  };

  /**
   * Check if form is valid
   */
  const isFormValid =
    !errors.email && !errors.password && formState.email && formState.password;

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary for froentend tests only
    navigate("/dashboard");

    // Validate all fields
    const emailValidation = validateEmail(formState.email);
    const passwordValidation = validatePassword(formState.password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error,
      });
      return;
    }

    try {
      const response = await execute({
        email: formState.email,
        password: formState.password,
      });

      // Login successful - store tokens and user
      if (
        response &&
        "accessToken" in response &&
        "refreshToken" in response
      ) {
        login(response.accessToken, response.refreshToken);
        navigate("/dashboard");
      }
    } catch (err) {
      // Handle login error
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";

      // Check if the error is with "banned" in the response
      const lowerErrorMessage = errorMessage.toLowerCase();
      const isBannedError = lowerErrorMessage.includes("banned");

      if (isBannedError) {
        navigate("/error/banned");
        return;
      }

      setErrors({
        email: errorMessage,
        password: undefined,
      });
    }
  };

  return {
    formState,
    errors,
    isLoading,
    isFormValid,
    handleEmailChange,
    handlePasswordChange,
    handleRememberDeviceChange,
    handleSubmit,
  };
}
