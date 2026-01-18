import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../../../api/hooks/requests/auth";
import { useAuthStore } from "../../../store/auth";
import { LoginFormSchema, type LoginFormState } from "../../../types/forms";

/**
 * Hook to manage login form state and submission
 *
 * @returns Login form state, handlers, and submission logic
 */
export function useLoginForm() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { execute, isLoading } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormState>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberDevice: false,
        },
    });

    /**
     * Handle form submission
     */
    const onSubmit = async (data: LoginFormState) => {
        try {
            const response = await execute({
                email: data.email,
                password: data.password,
            });

            // Login successful - store tokens and user
            if (
                response &&
                "accessToken" in response &&
                "refreshToken" in response
            ) {
                login(response.accessToken, response.refreshToken);
                navigate("/dashboard");
            } else {
                // Unexpected response format
                setError("email", {
                    type: "manual",
                    message: "Invalid response from server. Please try again.",
                });
            }
        } catch (err) {
            // Handle login error
            let errorMessage = "Login failed. Please try again.";

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "object" && err !== null) {
                // Try to extract error message from API response
                const apiError = err as { error?: { message?: string } };
                errorMessage =
                    apiError.error?.message ??
                    "Login failed. Please try again.";
            }

            // Check if the error is with "banned" in the response
            const lowerErrorMessage = errorMessage.toLowerCase();
            const isBannedError = lowerErrorMessage.includes("banned");

            if (isBannedError) {
                navigate("/error/banned");
                return;
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
        handleSubmit: handleSubmit(onSubmit),
    };
}
