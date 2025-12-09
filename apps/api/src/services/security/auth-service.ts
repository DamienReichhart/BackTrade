import {
    type AuthResponse,
    type LoginRequest,
    PublicUserSchema,
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

async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    authServiceLogger.trace(
        { payload },
        "Refresh token verified, trying to get user"
    );
    const user = await userService.getUserById(payload.sub.id);
    authServiceLogger.trace({ user }, "User found, generating new tokens");
    const publicUser = PublicUserSchema.parse(user);
    const accessToken = await jwtService.generateAccessToken({
        sub: publicUser,
    });
    const newRefreshToken = await jwtService.generateRefreshToken({
        sub: publicUser,
    });
    return {
        accessToken,
        refreshToken: newRefreshToken,
    } as AuthResponse;
}

async function register(
    registerRequest: RegisterRequest
): Promise<AuthResponse> {
    const user = await userService.createUser({
        email: registerRequest.email,
        password_hash: await hashService.hashPassword(registerRequest.password),
        role: Role.USER,
    });
    authServiceLogger.trace({ user }, "User created, generating tokens");
    const publicUser = PublicUserSchema.parse(user);
    const accessToken = await jwtService.generateAccessToken({
        sub: publicUser,
    });
    const refreshToken = await jwtService.generateRefreshToken({
        sub: publicUser,
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
