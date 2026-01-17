import { API_BASE_URL } from "../../index";
import { useAuthStore } from "../../../store/auth";
import { refreshToken as refreshTokenUtils } from "../../utils/refresh-token";

/**
 * Request configuration for fetch operations
 */
export interface FetchConfig {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    url: string;
    body?: BodyInit;
    headers?: Record<string, string>;
    contentType?: string;
}

/**
 * Options for handling token refresh
 */
interface TokenRefreshOptions {
    isRefreshingToken: React.MutableRefObject<boolean>;
    retryRequest: (token: string) => Promise<Response>;
}

/**
 * Handle 401 authentication errors with automatic token refresh
 *
 * @param response - The failed response
 * @param options - Token refresh options
 * @returns Promise that resolves with the retry response or rejects with error
 */
async function handleAuthError(
    response: Response,
    options: TokenRefreshOptions
): Promise<Response> {
    const { isRefreshingToken, retryRequest } = options;
    const { login, logout } = useAuthStore.getState();
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    // Try to refresh token if available and not already refreshing
    if (currentRefreshToken && !isRefreshingToken.current) {
        isRefreshingToken.current = true;
        try {
            const authResponse = await refreshTokenUtils(currentRefreshToken);
            if (authResponse) {
                login(authResponse.accessToken, authResponse.refreshToken);
                // Retry with the NEW token from the refresh response
                return await retryRequest(authResponse.accessToken);
            }
            // Token refresh failed - logout user
            logout();
            throw new Error("Session expired. Please log in again.");
        } finally {
            isRefreshingToken.current = false;
        }
    } else if (!currentRefreshToken) {
        // No refresh token available - logout user
        logout();
        throw new Error("Authentication required. Please log in.");
    }
    // If already refreshing, throw error to let React Query handle retry
    throw new Error("Token refresh in progress");
}

/**
 * Extract error message from response
 *
 * @param response - The failed response
 * @returns Error message string
 */
async function extractErrorMessage(response: Response): Promise<string> {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
            errorMessage = errorData.error.message;
        }
    } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
    }
    return errorMessage;
}

/**
 * Create headers for fetch request
 *
 * @param token - Access token (optional)
 * @param contentType - Content type header (optional, defaults to 'application/json')
 * @param body - Request body to check if it's FormData (FormData sets its own Content-Type)
 * @returns Headers object
 */
export function createHeaders(
    token?: string,
    contentType?: string,
    body?: BodyInit
): Record<string, string> {
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - browser sets it automatically with boundary
    if (contentType && !(body instanceof FormData)) {
        headers["Content-Type"] = contentType;
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Perform fetch request with automatic token refresh and error handling
 *
 * @param config - Fetch configuration
 * @param token - Current access token
 * @param isRefreshingToken - Ref to track refresh state
 * @returns Response object
 */
export async function performFetchWithAuth(
    config: FetchConfig,
    token: string | undefined,
    isRefreshingToken: React.MutableRefObject<boolean>
): Promise<Response> {
    const headers = createHeaders(
        token,
        config.contentType ?? "application/json",
        config.body
    );

    // Merge custom headers
    if (config.headers) {
        Object.assign(headers, config.headers);
    }

    const response = await fetch(API_BASE_URL + config.url, {
        method: config.method,
        headers: headers,
        body: config.body,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle auth error and retry with new token
            return handleAuthError(response, {
                isRefreshingToken,
                retryRequest: async (newToken: string) => {
                    // Retry the request with the new token
                    return performFetchWithAuth(
                        config,
                        newToken,
                        isRefreshingToken
                    );
                },
            });
        }

        // Handle other error statuses
        const errorMessage = await extractErrorMessage(response);
        throw new Error(errorMessage);
    }

    return response;
}
