import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../../api/hooks/requests/auth";
import { useAuthStore } from "../../../store/auth";
import {
    RegisterFormSchema,
    type RegisterFormState,
} from "../../../types/forms";

/**
 * Hook to manage register form state and submission
 *
 * @returns Register form state, handlers, and submission logic
 */
export function useRegisterForm() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { execute, isLoading } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setError,
    } = useForm<RegisterFormState>({
        resolver: zodResolver(RegisterFormSchema),
        mode: "onChange", // Enable real-time validation for button state
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    /**
     * Handle form submission
     */
    const onSubmit = async (data: RegisterFormState) => {
        try {
            const response = await execute({
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
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

            setError("email", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    return {
        register,
        errors,
        isLoading,
        isValid,
        handleSubmit: handleSubmit(onSubmit),
    };
}
