import {
    type AuthResponse,
    type LoginRequest,
    PublicUserSchema,
} from "@backtrade/types";
import userService from "../base/users-service";
import hashService from "./hash-service";
import { logger } from "../../libs/logger/pino";
import jwtService from "./jwt-service";

const authServiceLogger = logger.child({
    service: "auth-service",
});

async function login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const user = await userService.getUserByEmail(loginRequest.email);
    authServiceLogger.trace(
        { email: loginRequest.email },
        "User found, trying to verify password"
    );
    await hashService.verifyPassword(loginRequest.password, user.password_hash);
    authServiceLogger.trace(
        { email: loginRequest.email },
        "Password verified, generating tokens"
    );
    const publicUser = PublicUserSchema.parse(user);

    const accessToken = await jwtService.generateAccessToken({
        sub: publicUser,
    });

    const refreshToken = await jwtService.generateRefreshToken({
        sub: publicUser,
    });

    authServiceLogger.trace(
        { email: loginRequest.email },
        "Tokens generated, returning response"
    );

    return {
        accessToken,
        refreshToken,
    } as AuthResponse;
}

export default {
    login,
};
