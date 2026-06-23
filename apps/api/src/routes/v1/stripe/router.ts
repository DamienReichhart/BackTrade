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

/**
 * Billing overview
 *
 * GET /api/v1/stripe/billing
 */
stripeRouter.get(
    "/billing",
    authMiddleware,
    stripeController.getBillingOverview.bind(stripeController)
);

/**
 * Invoices
 *
 * GET /api/v1/stripe/invoices
 */
stripeRouter.get(
    "/invoices",
    authMiddleware,
    stripeController.listInvoices.bind(stripeController)
);

/**
 * Preview a plan change (proration)
 *
 * POST /api/v1/stripe/subscription/preview
 */
stripeRouter.post(
    "/subscription/preview",
    authMiddleware,
    stripeController.previewPlanChange.bind(stripeController)
);

/**
 * Apply a plan change
 *
 * POST /api/v1/stripe/subscription/change
 */
stripeRouter.post(
    "/subscription/change",
    authMiddleware,
    stripeController.changePlan.bind(stripeController)
);

/**
 * Cancel at period end
 *
 * POST /api/v1/stripe/subscription/cancel
 */
stripeRouter.post(
    "/subscription/cancel",
    authMiddleware,
    stripeController.cancelSubscription.bind(stripeController)
);

/**
 * Resume (undo scheduled cancellation)
 *
 * POST /api/v1/stripe/subscription/resume
 */
stripeRouter.post(
    "/subscription/resume",
    authMiddleware,
    stripeController.resumeSubscription.bind(stripeController)
);

export default stripeRouter;
