/**
 * Stripe Controller
 *
 * Handles Stripe-related HTTP requests including checkout sessions,
 * customer portal, and webhook events.
 */

import type { Request, Response } from "express";
import { stripeService, webhookService } from "../services/stripe";
import { logger } from "../libs/pino";
import BadRequestError from "../errors/web/bad-request-error";
import { SessionIdParamsSchema } from "@backtrade/types";

/**
 * Stripe Controller
 *
 * Handles Stripe-related HTTP requests.
 */
class StripeController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "stripe-controller",
        });
    }

    /**
     * Create a Stripe Checkout Session
     *
     * POST /stripe/checkout
     *
     * @param req - Express request (req.user guaranteed by authMiddleware)
     * @param res - Express response
     * @throws BadRequestError if planId is missing
     */
    async createCheckoutSession(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { planId } = req.body;

        if (!planId || typeof planId !== "number") {
            throw new BadRequestError(
                "Plan ID is required and must be a number"
            );
        }

        this.logger.trace(
            { userId: user.id, planId },
            "Creating checkout session"
        );

        const session = await stripeService.createCheckoutSession(user, planId);

        this.logger.info(
            { userId: user.id, planId, sessionId: session.sessionId },
            "Checkout session created"
        );

        res.status(200).json(session);
    }

    /**
     * Create a Stripe Customer Portal Session
     *
     * POST /stripe/portal
     *
     * @param req - Express request (req.user guaranteed by authMiddleware)
     * @param res - Express response
     */
    async createPortalSession(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        this.logger.trace({ userId: user.id }, "Creating portal session");

        const session = await stripeService.createPortalSession(user);

        this.logger.info({ userId: user.id }, "Portal session created");

        res.status(200).json(session);
    }

    /**
     * Get Checkout Session status
     *
     * GET /stripe/checkout/:sessionId
     *
     * Used by the success page to verify the checkout completed.
     *
     * @param req - Express request (req.user guaranteed by authMiddleware)
     * @param res - Express response
     * @throws BadRequestError if sessionId is invalid or missing
     */
    async getCheckoutSession(req: Request, res: Response): Promise<void> {
        let sessionId: string;
        try {
            ({ sessionId } = SessionIdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        this.logger.trace({ sessionId }, "Retrieving checkout session");

        const session = await stripeService.getCheckoutSession(sessionId);

        res.status(200).json(session);
    }

    /**
     * Handle Stripe Webhook
     *
     * POST /stripe/webhook
     *
     * IMPORTANT: This endpoint receives raw body (Buffer) for signature verification.
     * The raw body middleware must be applied before express.json().
     *
     * @param req - Express request with raw body
     * @param res - Express response
     */
    async handleWebhook(req: Request, res: Response): Promise<void> {
        const signature = req.headers["stripe-signature"];

        if (!signature || typeof signature !== "string") {
            this.logger.warn("Missing Stripe signature header");
            res.status(400).json({ error: "Missing signature" });
            return;
        }

        try {
            // req.body is raw Buffer due to express.raw() middleware
            const event = webhookService.constructEvent(
                req.body as Buffer,
                signature
            );

            this.logger.debug(
                { eventId: event.id, type: event.type },
                "Webhook event received"
            );

            // Process asynchronously but respond immediately
            // This prevents Stripe from timing out on long-running handlers
            webhookService.processEvent(event).catch((error) => {
                this.logger.error(
                    { error, eventId: event.id },
                    "Async event processing failed"
                );
            });

            res.status(200).json({ received: true });
        } catch (error) {
            this.logger.error(
                { error },
                "Webhook signature verification failed"
            );
            res.status(400).json({ error: "Invalid signature" });
        }
    }
}

export default new StripeController();
