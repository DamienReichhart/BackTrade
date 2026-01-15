import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useForgotPassword,
    useResetPassword,
} from "../../../api/hooks/requests/auth";
import {
    ForgotPasswordFormSchema,
    ResetPasswordFormSchema,
    type ForgotPasswordFormState,
    type ResetPasswordFormState,
} from "../../../types/forms";

/**
 * Hook to manage forgot password form state and submission
 *
 * Handles two-step process:
 * 1. Request password reset code by email
 * 2. Reset password with code and new password
 */
export function useForgotPasswordForm() {
    const navigate = useNavigate();
    const { execute: requestPasswordReset, isLoading: isRequestingReset } =
        useForgotPassword();
    const { execute: resetPassword, isLoading: isResettingPassword } =
        useResetPassword();

    const [step, setStep] = useState<1 | 2>(1);

    const step1Form = useForm<ForgotPasswordFormState>({
        resolver: zodResolver(ForgotPasswordFormSchema),
        defaultValues: {
            email: "",
        },
    });

    const step2Form = useForm<ResetPasswordFormState>({
        resolver: zodResolver(ResetPasswordFormSchema),
        defaultValues: {
            email: "",
            code: "",
            newPassword: "",
        },
    });

    const isLoading = isRequestingReset || isResettingPassword;

    /**
     * Handle step 1 submission - request password reset code
     */
    const onStep1Submit = async (data: ForgotPasswordFormState) => {
        try {
            await requestPasswordReset({
                email: data.email,
            });

            // Success - move to step 2
            setStep(2);
            // Pre-fill email for step 2
            step2Form.setValue("email", data.email);
        } catch (err) {
            // Handle error - check for 404 (user not found)
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Request failed. Please try again.";

            // Extract status code from error message (format: "HTTP 404: ..." or "HTTP 404")
            const statusMatch = errorMessage.match(/HTTP\s+(\d+)/);
            const statusCode = statusMatch
                ? parseInt(statusMatch[1], 10)
                : null;

            if (statusCode === 404) {
                step1Form.setError("email", {
                    type: "manual",
                    message: "User not found. Please check your email address.",
                });
                return;
            }

            step1Form.setError("email", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    /**
     * Handle step 2 submission - reset password with code
     */
    const onStep2Submit = async (data: ResetPasswordFormState) => {
        try {
            await resetPassword({
                email: data.email,
                code: data.code,
                newPassword: data.newPassword,
            });

            // Success - redirect to login
            navigate("/signin");
        } catch (err) {
            // Handle error - check for 403 (wrong code)
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Reset failed. Please try again.";

            // Extract status code from error message (format: "HTTP 403: ..." or "HTTP 403")
            const statusMatch = errorMessage.match(/HTTP\s+(\d+)/);
            const statusCode = statusMatch
                ? parseInt(statusMatch[1], 10)
                : null;

            if (statusCode === 403) {
                step2Form.setError("code", {
                    type: "manual",
                    message:
                        "Invalid verification code. Please check and try again.",
                });
                return;
            }

            step2Form.setError("root", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    /**
     * Handle back to step 1
     */
    const handleBackToStep1 = () => {
        setStep(1);
        step2Form.reset();
    };

    return {
        step,
        step1Form,
        step2Form,
        isLoading,
        handleStep1Submit: step1Form.handleSubmit(onStep1Submit),
        handleStep2Submit: step2Form.handleSubmit(onStep2Submit),
        handleBackToStep1,
    };
}
