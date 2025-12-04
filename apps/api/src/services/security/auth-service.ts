import {
    type AuthResponse,
    type LoginRequest,
    PublicUserSchema,
} from "@backtrade/types";
import userService from "../crud/users-service";
import hashService from "./hash-service";
import { logger } from "../../libs/logger/pino";
import UnauthorizedError from "../../errors/web/unauthorized-error";
import jwtService from "./jwt-service";

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

        const accessToken = await jwtService.generateAccessToken(
            { sub: publicUser }
        );

        const refreshToken = await jwtService.generateRefreshToken(
            { sub: publicUser }
        );

        return {
            accessToken,
            refreshToken,
        } as AuthResponse;
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
