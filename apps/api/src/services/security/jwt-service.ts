import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { logger } from "../../libs/logger/pino";
import UnAuthenticatedError from "../../errors/web/unauthenticated-error";
import type { JwtPayload, JwtPayloadGeneration } from "@backtrade/types";

const jwtServiceLogger = logger.child({
    service: "jwt-service",
});

async function generateAccessToken(
    payload: JwtPayloadGeneration
): Promise<JwtPayload> {
    const token = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: ENV.ACCESS_TOKEN_EXPIRATION,
    } as jwt.SignOptions);
    jwtServiceLogger.debug({ payload }, "Access token generated");
    return token as unknown as JwtPayload;
}

async function generateRefreshToken(
    payload: JwtPayloadGeneration
): Promise<JwtPayload> {
    const token = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: ENV.REFRESH_TOKEN_EXPIRATION,
    } as jwt.SignOptions);
    jwtServiceLogger.debug({ payload }, "Refresh token generated");
    return token as unknown as JwtPayload;
}

async function verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
        const payload = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET, {
            algorithms: ["HS256"],
        } as jwt.VerifyOptions);
        jwtServiceLogger.debug({ payload }, "Access token verified");
        return payload as unknown as JwtPayload;
    } catch (error) {
        jwtServiceLogger.warn({ error }, "Access token verification failed");
        throw new UnAuthenticatedError("Invalid access token");
    }
}

async function verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
        const payload = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET, {
            algorithms: ["HS256"],
        } as jwt.VerifyOptions);
        jwtServiceLogger.debug({ payload }, "Refresh token verified");
        return payload as unknown as JwtPayload;
    } catch (error) {
        jwtServiceLogger.warn({ error }, "Refresh token verification failed");
        throw new UnAuthenticatedError("Invalid refresh token");
    }
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
