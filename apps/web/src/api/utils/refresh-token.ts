import { API_BASE_URL } from "../index";
import { RefreshTokenRequestSchema, AuthResponseSchema } from "@backtrade/types";

export const refreshToken = async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: RefreshTokenRequestSchema.parse({
            refreshToken: refreshToken,
        }).toString(),
    });
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    const authResponse = AuthResponseSchema.parse(data);
    return authResponse;
}