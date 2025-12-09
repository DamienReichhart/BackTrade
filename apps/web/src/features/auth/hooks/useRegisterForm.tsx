import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../../../api/hooks/requests/auth";
import { useAuthStore } from "../../../store/auth";
import {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
} from "@backtrade/utils";

/**
 * Register form state
 */
export interface RegisterFormState {
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

/**
 * Register form errors
 */
export interface RegisterFormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/**
 * Hook to manage register form state and submission
 *
 * @returns Register form state, handlers, and submission logic
 */
export function useRegisterForm() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { execute, isLoading } = useRegister();

    const [formState, setFormState] = useState<RegisterFormState>({
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({
        email: "Enter a valid email.",
        password: "Minimum 8 characters.",
        confirmPassword: "Passwords must match.",
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

        const passwordValidation = validatePassword(value);
        setErrors((prev) => ({
            ...prev,
            password: passwordValidation.isValid
                ? undefined
                : passwordValidation.error,
        }));

        // Validate password match if confirm password has value
        if (formState.confirmPassword) {
            const confirmationValidation = validatePasswordConfirmation(
                value,
                formState.confirmPassword
            );
            setErrors((prev) => ({
                ...prev,
                confirmPassword: confirmationValidation.isValid
                    ? undefined
                    : confirmationValidation.error,
            }));
        }
    };

    /**
     * Handle confirm password input change
     */
    const handleConfirmPasswordChange = (value: string) => {
        setFormState((prev) => ({ ...prev, confirmPassword: value }));

        const validation = validatePasswordConfirmation(
            formState.password,
            value
        );
        setErrors((prev) => ({
            ...prev,
            confirmPassword: validation.isValid ? undefined : validation.error,
        }));
    };

    /**
     * Handle terms acceptance toggle
     */
    const handleAcceptTermsChange = (checked: boolean) => {
        setFormState((prev) => ({ ...prev, acceptTerms: checked }));
    };

    /**
     * Check if form is valid
     */
    const isFormValid =
        !errors.email &&
        !errors.password &&
        !errors.confirmPassword &&
        formState.email &&
        formState.password &&
        formState.confirmPassword &&
        formState.acceptTerms;

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const emailValidation = validateEmail(formState.email);
        const passwordValidation = validatePassword(formState.password);
        const confirmationValidation = validatePasswordConfirmation(
            formState.password,
            formState.confirmPassword
        );

        if (
            !emailValidation.isValid ||
            !passwordValidation.isValid ||
            !confirmationValidation.isValid
        ) {
            setErrors({
                email: emailValidation.error,
                password: passwordValidation.error,
                confirmPassword: confirmationValidation.error,
            });
            return;
        }

        if (!formState.acceptTerms) {
            return;
        }

        try {
            const response = await execute({
                email: formState.email,
                password: formState.password,
                confirmPassword: formState.confirmPassword,
            });

            // Registration successful - store tokens and user
            if (
                response &&
                "accessToken" in response &&
                "refreshToken" in response
            ) {
                login(response.accessToken, response.refreshToken);
                navigate("/dashboard");
            }
        } catch (err) {
            // Handle registration error
            let errorMessage = "Registration failed. Please try again.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "object" && err !== null) {
                // Try to extract error message from API response
                const apiError = err as { error?: { message?: string } };
                errorMessage =
                    apiError.error?.message ??
                    "Registration failed. Please try again.";
            }

            setErrors({
                email: errorMessage,
                password: undefined,
                confirmPassword: undefined,
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
        handleConfirmPasswordChange,
        handleAcceptTermsChange,
        handleSubmit,
    };
}
