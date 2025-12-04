import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { logger } from "../../libs/logger/pino";

const jwtServiceLogger = logger.child({
    service: "jwt-service",
});

async function generateAccessToken(payload: any): Promise<string> {
    const token = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: ENV.ACCESS_TOKEN_EXPIRATION,
    } as jwt.SignOptions);
    jwtServiceLogger.debug({ payload }, "Access token generated");
    return token;
}

async function generateRefreshToken(payload: any): Promise<string> {
    const token = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: ENV.REFRESH_TOKEN_EXPIRATION,
    } as jwt.SignOptions);
    jwtServiceLogger.debug({ payload }, "Refresh token generated");
    return token;
}

async function verifyAccessToken(token: string): Promise<boolean> {
    const payload = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET, {
        algorithms: ["HS256"],
    } as jwt.VerifyOptions,
    (error, _decoded) => {
        if (error) {
            jwtServiceLogger.warn({ error }, "Access token verification failed");
            return false;
        }
    });
    jwtServiceLogger.debug({ payload }, "Access token verified");
    return true;
}

async function verifyRefreshToken(token: string): Promise<boolean> {
    const payload = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET, {
        algorithms: ["HS256"],
    } as jwt.VerifyOptions,
    (error, _decoded) => {
        if (error) {
            jwtServiceLogger.warn({ error }, "Refresh token verification failed");
            return false;
        }
        return true;
    });
    jwtServiceLogger.debug({ payload }, "Refresh token verified");
    return true;
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};