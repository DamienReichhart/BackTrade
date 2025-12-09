import {
    type AuthResponse,
    type LoginRequest,
    type RegisterRequest,
} from "@backtrade/types";
import { Role } from "../../generated/prisma/client";
import userService from "../base/users-service";
import hashService from "./hash-service";
import { logger } from "../../libs/logger/pino";
import jwtService from "./jwt-service";

const authServiceLogger = logger.child({
    service: "auth-service",
});

/**
 * Authenticate user with email and password
 *
 * @param loginRequest - Login credentials
 * @returns Access and refresh tokens
 */
async function login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const user = await userService.getUserByEmail(loginRequest.email);
    authServiceLogger.trace(
        { userId: user.id },
        "User found, trying to verify password"
    );
    await hashService.verifyPassword(loginRequest.password, user.password_hash);
    authServiceLogger.trace(
        { userId: user.id },
        "Password verified, generating tokens"
    );

    const accessToken = await jwtService.generateAccessToken({
        sub: user.id,
    });

    const refreshToken = await jwtService.generateRefreshToken({
        sub: user.id,
    });

    authServiceLogger.trace(
        { userId: user.id },
        "Tokens generated, returning response"
    );

    return {
        accessToken,
        refreshToken,
    } as AuthResponse;
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - Valid refresh token
 * @returns New access and refresh tokens
 */
async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    authServiceLogger.trace(
        { payload },
        "Refresh token verified, trying to get user"
    );
    const user = await userService.getUserById(payload.sub);
    authServiceLogger.trace({ userId: user.id }, "User found, generating new tokens");
    const accessToken = await jwtService.generateAccessToken({
        sub: user.id,
    });
    const newRefreshToken = await jwtService.generateRefreshToken({
        sub: user.id,
    });
    return {
        accessToken,
        refreshToken: newRefreshToken,
    } as AuthResponse;
}

/**
 * Register new user account
 *
 * @param registerRequest - Registration details
 * @returns Access and refresh tokens for new user
 */
async function register(
    registerRequest: RegisterRequest
): Promise<AuthResponse> {
    const user = await userService.createUser({
        email: registerRequest.email,
        password_hash: await hashService.hashPassword(registerRequest.password),
        role: Role.USER,
    });
    authServiceLogger.trace({ userId: user.id }, "User created, generating tokens");
    const accessToken = await jwtService.generateAccessToken({
        sub: user.id,
    });
    const refreshToken = await jwtService.generateRefreshToken({
        sub: user.id,
    });
    return {
        accessToken,
        refreshToken,
    } as AuthResponse;
}

export default {
    login,
    refreshToken,
    register,
};
