import {
    AuthResponseSchema,
    type AuthResponse,
    type LoginRequest,
    PublicUserSchema,
} from "@backtrade/types";
import userService from "../crud/users-service";
import hashService from "./hash-service";
import { logger } from "../../libs/logger/pino";
import UnauthorizedError from "../../errors/web/unauthorized-error";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";

const authServiceLogger = logger.child({
    service: "auth-service",
});

async function login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const user = await userService.getUserByEmail(loginRequest.email);
    if (
        await hashService.verifyPassword(
            loginRequest.password,
            user.password_hash
        )
    ) {
        authServiceLogger.info({ email: loginRequest.email }, "User logged in");
        const publicUser = PublicUserSchema.parse(user);

        const accessToken = jwt.sign(
            { sub: publicUser },
            ENV.ACCESS_TOKEN_SECRET,
            {
                algorithm: "HS256",
                expiresIn: ENV.ACCESS_TOKEN_EXPIRATION,
            } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { sub: publicUser },
            ENV.REFRESH_TOKEN_SECRET,
            {
                algorithm: "HS256",
                expiresIn: ENV.REFRESH_TOKEN_EXPIRATION,
            } as jwt.SignOptions
        );

        return AuthResponseSchema.parse({
            accessToken,
            refreshToken,
        });
    }
    authServiceLogger.info(
        { email: loginRequest.email },
        "Invalid credentials"
    );
    throw new UnauthorizedError("Invalid credentials");
}

export default {
    login,
};
