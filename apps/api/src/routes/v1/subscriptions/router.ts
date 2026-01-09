/**
 * Subscriptions Router
 *
 * Routes for subscription management.
 *
 * Authorization model:
 * - GET /subscriptions: Auth required (users see own, admins see all)
 * - GET /subscriptions/:id: Auth required + ownership or admin
 * - POST /subscriptions: Admin only
 * - PATCH /subscriptions/:id: Admin only
 * - DELETE /subscriptions/:id: Admin only
 */

import { Router } from "express";
import subscriptionsController from "../../../controllers/subscriptions-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { adminMiddleware } from "../../../middlewares/admin-middleware";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreateSubscriptionRequestSchema,
    UpdateSubscriptionRequestSchema,
} from "@backtrade/types";

const subscriptionsRouter = Router();

// Routes requiring authentication (ownership check in service)
subscriptionsRouter.get(
    "/",
    authMiddleware,
    subscriptionsController.getAllSubscriptions.bind(subscriptionsController)
);

subscriptionsRouter.get(
    "/:id",
    authMiddleware,
    subscriptionsController.getSubscriptionById.bind(subscriptionsController)
);

// Admin-only routes
subscriptionsRouter.post(
    "/",
    authMiddleware,
    adminMiddleware,
    inputValidations(CreateSubscriptionRequestSchema),
    subscriptionsController.createSubscription.bind(subscriptionsController)
);

subscriptionsRouter.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    inputValidations(UpdateSubscriptionRequestSchema),
    subscriptionsController.updateSubscription.bind(subscriptionsController)
);

subscriptionsRouter.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    subscriptionsController.deleteSubscription.bind(subscriptionsController)
);

export default subscriptionsRouter;
