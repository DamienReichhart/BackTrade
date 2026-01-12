/**
 * Stripe Router
 *
 * Routes for Stripe operations including checkout, portal, and webhooks.
 *
 * IMPORTANT: The webhook route is NOT defined here because it requires
 * raw body parsing which must happen BEFORE the global express.json() middleware.
 * The webhook route is defined in app.ts.
 *
 * Authorization:
 * - POST /checkout: Authenticated users only
 * - POST /portal: Authenticated users only
 * - GET /checkout/:sessionId: Authenticated users only
 */

import { Router } from "express";
import stripeController from "../../../controllers/stripe-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const stripeRouter = Router();

/**
 * Create Checkout Session
 *
 * POST /api/v1/stripe/checkout
 * Body: { planId: number }
 * Returns: { sessionId: string, url: string }
 */
stripeRouter.post(
    "/checkout",
    authMiddleware,
    stripeController.createCheckoutSession.bind(stripeController)
);

/**
 * Create Customer Portal Session
 *
 * POST /api/v1/stripe/portal
 * Returns: { url: string }
 */
stripeRouter.post(
    "/portal",
    authMiddleware,
    stripeController.createPortalSession.bind(stripeController)
);

/**
 * Get Checkout Session Status
 *
 * GET /api/v1/stripe/checkout/:sessionId
 * Returns: { status: string, subscriptionId: string | null, customerId: string | null }
 */
stripeRouter.get(
    "/checkout/:sessionId",
    authMiddleware,
    stripeController.getCheckoutSession.bind(stripeController)
);

export default stripeRouter;
