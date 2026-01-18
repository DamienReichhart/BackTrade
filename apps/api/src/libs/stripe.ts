/**
 * Stripe SDK Initialization
 *
 * Initializes the Stripe client with the secret key and API version.
 * Uses the latest stable API version for all Stripe operations.
 */

import Stripe from "stripe";
import { ENV } from "../config/env";

/**
 * Stripe client instance
 *
 * Configured with:
 * - Secret key from environment
 * - Latest API version (2025-12-15.clover)
 * - TypeScript support enabled
 */
export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});
