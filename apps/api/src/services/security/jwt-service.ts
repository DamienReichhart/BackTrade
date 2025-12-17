import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { logger } from "../../libs/pino";
import UnAuthenticatedError from "../../errors/web/unauthenticated-error";
import {
    type JwtPayload,
    type JwtPayloadGeneration,
    JwtPayloadSchema,
} from "@backtrade/types";

/**
 * JWT Service
 *
 * Handles JWT token generation and verification for authentication.
 */
class JwtService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "jwt-service",
        });
    }

    /**
     * Generate an access token
     *
     * @param payload - The payload to encode in the token
     * @returns The signed access token
     */
    async generateAccessToken(payload: JwtPayloadGeneration): Promise<string> {
        const token = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: ENV.ACCESS_TOKEN_EXPIRATION,
        } as jwt.SignOptions);
        this.logger.debug({ payload }, "Access token generated");
        return token;
    }

    /**
     * Generate a refresh token
     *
     * @param payload - The payload to encode in the token
     * @returns The signed refresh token
     */
    async generateRefreshToken(payload: JwtPayloadGeneration): Promise<string> {
        const token = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: ENV.REFRESH_TOKEN_EXPIRATION,
        } as jwt.SignOptions);
        this.logger.debug({ payload }, "Refresh token generated");
        return token;
    }

    /**
     * Verify an access token
     *
     * @param token - The access token to verify
     * @returns The decoded payload
     * @throws UnAuthenticatedError if token is invalid
     */
    async verifyAccessToken(token: string): Promise<JwtPayload> {
        try {
            const payload = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET, {
                algorithms: ["HS256"],
            } as jwt.VerifyOptions);
            this.logger.debug({ payload }, "Access token verified");
            return JwtPayloadSchema.parse(payload);
        } catch (error) {
            this.logger.warn({ error }, "Access token verification failed");
            throw new UnAuthenticatedError("Invalid access token");
        }
    }

    /**
     * Verify a refresh token
     *
     * @param token - The refresh token to verify
     * @returns The decoded payload
     * @throws UnAuthenticatedError if token is invalid
     */
    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        try {
            const payload = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET, {
                algorithms: ["HS256"],
            } as jwt.VerifyOptions);
            const validatedPayload = JwtPayloadSchema.parse(payload);
            this.logger.debug(
                { payload: validatedPayload },
                "Refresh token verified"
            );
            return validatedPayload;
        } catch (error) {
            this.logger.warn({ error }, "Refresh token verification failed");
            throw new UnAuthenticatedError("Invalid refresh token");
        }
    }
}

export default new JwtService();
