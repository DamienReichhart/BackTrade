/**
 * Hash Service
 *
 * Provides secure password hashing and verification using argon2.
 */

import { verify, hash, argon2id } from "argon2";

/**
 * Hashes a plain text password using bcrypt
 *
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    type: argon2id,
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3, // iterations
    parallelism: 1, // threads
  });
}

/**
 * Verifies a plain text password against a bcrypt hash
 *
 * @param password - The plain text password to verify
 * @param hashedPassword - The bcrypt hash to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await verify(hashedPassword, password);
}
