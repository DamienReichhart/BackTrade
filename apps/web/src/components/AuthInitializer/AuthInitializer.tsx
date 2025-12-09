import { useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useCurrentUser } from "../../api/hooks/requests/auth";

interface AuthInitializerProps {
    children: React.ReactNode;
}

/**
 * Component that initializes authentication state on app load
 *
 * When access tokens exist in cookies, this component fetches the current
 * user from the /auth/me endpoint and updates the auth store.
 *
 * This replaces the previous approach of extracting user data from the JWT,
 * keeping tokens lean (containing only user ID) while still having full
 * user data available in the store.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
    const { accessToken, setUser, isInitialized } = useAuthStore();
    const hasToken = !!accessToken;

    const {
        data: user,
        isLoading,
        error,
    } = useCurrentUser({
        enabled: hasToken && !isInitialized,
    });

    useEffect(() => {
        if (!hasToken) {
            // No token means not authenticated - mark as initialized
            setUser(null);
            return;
        }

        if (isLoading) {
            return;
        }

        if (error) {
            // Failed to fetch user (token might be invalid) - clear user
            setUser(null);
            return;
        }

        if (user) {
            setUser(user);
        }
    }, [hasToken, user, isLoading, error, setUser]);

    return <>{children}</>;
}
