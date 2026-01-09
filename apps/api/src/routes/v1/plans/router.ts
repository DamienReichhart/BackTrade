/**
 * Plans Router
 *
 * Routes for subscription plan management.
 *
 * Authorization model:
 * - GET /plans: Public (any authenticated user)
 * - GET /plans/:id: Public (any authenticated user)
 * - POST /plans: Admin only
 * - PATCH /plans/:id: Admin only
 * - DELETE /plans/:id: Admin only
 */

import { Router } from "express";
import plansController from "../../../controllers/plans-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { adminMiddleware } from "../../../middlewares/admin-middleware";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreatePlanRequestSchema,
    UpdatePlanRequestSchema,
} from "@backtrade/types";

const plansRouter = Router();

// Public routes (any authenticated user)
plansRouter.get(
    "/",
    authMiddleware,
    plansController.getAllPlans.bind(plansController)
);

plansRouter.get(
    "/:id",
    authMiddleware,
    plansController.getPlanById.bind(plansController)
);

// Admin-only routes
plansRouter.post(
    "/",
    authMiddleware,
    adminMiddleware,
    inputValidations(CreatePlanRequestSchema),
    plansController.createPlan.bind(plansController)
);

plansRouter.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    inputValidations(UpdatePlanRequestSchema),
    plansController.updatePlan.bind(plansController)
);

plansRouter.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    plansController.deletePlan.bind(plansController)
);

export default plansRouter;
