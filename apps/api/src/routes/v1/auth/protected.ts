import { Router } from "express";
import { responseValidator } from "../../../middlewares/output-validator";
import { PublicUserSchema } from "@backtrade/types";
import authController from "../../../controllers/auth-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const authProtectedRouter = Router();

/**
 * GET /auth/me
 *
 * Returns the current authenticated user's public profile.
 * Requires valid access token in Authorization header.
 */
authProtectedRouter.get(
    "/me",
    authMiddleware,
    responseValidator(PublicUserSchema),
    authController.me
);

export default authProtectedRouter;
