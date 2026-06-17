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
 * - Latest API version (2026-05-27.dahlia)
 * - TypeScript support enabled
 */
export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
});
