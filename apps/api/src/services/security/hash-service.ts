/**
 * Hash Service
 *
 * Provides secure password hashing and verification using argon2.
 */

import { verify, hash, argon2id } from "argon2";
import { logger } from "../../libs/logger/pino";
import UnAuthenticatedError from "../../errors/web/unauthenticated-error";

const hashServiceLogger = logger.child({
    service: "hash-service",
});

/**
 * Hashes a plain text password using argon2
 *
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password string
 */
async function hashPassword(password: string): Promise<string> {
    return await hash(password, {
        type: argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3, // iterations
        parallelism: 1, // threads
    });
}

/**
 * Verifies a plain text password against a argon2 hash
 *
 * @param password - The plain text password to verify
 * @param hashedPassword - The argon2 hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const result = await verify(hashedPassword, password);
    if (!result) {
        hashServiceLogger.warn("Password verification failed");
        throw new UnAuthenticatedError("Invalid password");
    }
    return result;
}

export default {
    hashPassword,
    verifyPassword,
};
