import { Router } from "express";
import inputValidations from "../../../middlewares/input-validations";
import { responseValidator } from "../../../middlewares/output-validator";
import {
    LoginRequestSchema,
    AuthResponseSchema,
    RefreshTokenRequestSchema,
} from "@backtrade/types";
import authController from "../../../controllers/auth-controller";

const authPublicRouter = Router();

authPublicRouter.post(
    "/login",
    inputValidations(LoginRequestSchema),
    responseValidator(AuthResponseSchema),
    authController.login
);

authPublicRouter.post(
    "/refresh-token",
    inputValidations(RefreshTokenRequestSchema),
    responseValidator(AuthResponseSchema),
    authController.refreshToken
);

export default authPublicRouter;
