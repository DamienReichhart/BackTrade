import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useForgotPassword,
  useResetPassword,
} from "../../../api/hooks/requests/auth";
import { validateEmail, validatePassword } from "@backtrade/utils";

/**
 * Forgot password form state
 */
export interface ForgotPasswordFormState {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Forgot password form errors
 */
export interface ForgotPasswordFormErrors {
  email?: string;
  code?: string;
  newPassword?: string;
  general?: string;
}

/**
 * Hook to manage forgot password form state and submission
 *
 * Handles two-step process:
 * 1. Request password reset code by email
 * 2. Reset password with code and new password
 *
 * @returns Forgot password form state, handlers, and submission logic
 */
export function useForgotPasswordForm() {
  const navigate = useNavigate();
  const { execute: requestPasswordReset, isLoading: isRequestingReset } =
    useForgotPassword();
  const { execute: resetPassword, isLoading: isResettingPassword } =
    useResetPassword();

  const [step, setStep] = useState<1 | 2>(1);
  const [formState, setFormState] = useState<ForgotPasswordFormState>({
    email: "",
    code: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({
    email: "Enter a valid email.",
  });

  const isLoading = isRequestingReset || isResettingPassword;

  /**
   * Handle email input change
   */
  const handleEmailChange = (value: string) => {
    setFormState((prev) => ({ ...prev, email: value }));

    const validation = validateEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validation.isValid ? undefined : validation.error,
      general: undefined,
    }));
  };

  /**
   * Handle code input change
   */
  const handleCodeChange = (value: string) => {
    setFormState((prev) => ({ ...prev, code: value }));

    if (value.length === 0) {
      setErrors((prev) => ({
        ...prev,
        code: "Enter the verification code.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        code: undefined,
        general: undefined,
      }));
    }
  };

  /**
   * Handle new password input change
   */
  const handleNewPasswordChange = (value: string) => {
    setFormState((prev) => ({ ...prev, newPassword: value }));

    const validation = validatePassword(value);
    setErrors((prev) => ({
      ...prev,
      newPassword: validation.isValid ? undefined : validation.error,
      general: undefined,
    }));
  };

  /**
   * Check if step 1 form is valid
   */
  const isStep1Valid = !errors.email && formState.email.length > 0;

  /**
   * Check if step 2 form is valid
   */
  const isStep2Valid =
    !errors.code &&
    !errors.newPassword &&
    formState.code.length > 0 &&
    formState.newPassword.length > 0;

  /**
   * Handle step 1 submission - request password reset code
   */
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(formState.email);
    if (!emailValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        general: undefined,
      });
      return;
    }

    try {
      const response = await requestPasswordReset({
        email: formState.email,
      });

      // Success - move to step 2
      if (response?.status === 200) {
        setStep(2);
        setErrors({});
      }
    } catch (err) {
      // Handle error - check for 404 (user not found)
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Request failed. Please try again.";

      // Extract status code from error message (format: "HTTP 404: ..." or "HTTP 404")
      const statusMatch = errorMessage.match(/HTTP\s+(\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : null;

      if (statusCode === 404) {
        setErrors({
          email: "User not found. Please check your email address.",
          general: undefined,
        });
        return;
      }

      setErrors({
        email: errorMessage,
        general: undefined,
      });
    }
  };

  /**
   * Handle step 2 submission - reset password with code
   */
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate code and password
    const passwordValidation = validatePassword(formState.newPassword);
    if (!passwordValidation.isValid) {
      setErrors({
        code: undefined,
        newPassword: passwordValidation.error,
        general: undefined,
      });
      return;
    }

    if (formState.code.length === 0) {
      setErrors({
        code: "Enter the verification code.",
        newPassword: undefined,
        general: undefined,
      });
      return;
    }

    try {
      const response = await resetPassword({
        code: formState.code,
        newPassword: formState.newPassword,
      });

      // Success - redirect to login
      if (response?.status === 200 || response?.status === 204) {
        navigate("/signin");
      }
    } catch (err) {
      // Handle error - check for 403 (wrong code)
      const errorMessage =
        err instanceof Error ? err.message : "Reset failed. Please try again.";

      // Extract status code from error message (format: "HTTP 403: ..." or "HTTP 403")
      const statusMatch = errorMessage.match(/HTTP\s+(\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : null;

      if (statusCode === 403) {
        setErrors({
          code: "Invalid verification code. Please check and try again.",
          newPassword: undefined,
          general: undefined,
        });
        return;
      }

      setErrors({
        general: errorMessage,
        code: undefined,
        newPassword: undefined,
      });
    }
  };

  /**
   * Handle back to step 1
   */
  const handleBackToStep1 = () => {
    setStep(1);
    setFormState((prev) => ({ ...prev, code: "", newPassword: "" }));
    setErrors({
      email: formState.email ? undefined : "Enter a valid email.",
      code: undefined,
      newPassword: undefined,
      general: undefined,
    });
  };

  return {
    step,
    formState,
    errors,
    isLoading,
    isStep1Valid,
    isStep2Valid,
    handleEmailChange,
    handleCodeChange,
    handleNewPasswordChange,
    handleStep1Submit,
    handleStep2Submit,
    handleBackToStep1,
  };
}
