import { Router } from "express";
import inputValidations from "../../../middlewares/input-validations";
import {
    LoginRequestSchema,
    RefreshTokenRequestSchema,
    RegisterRequestSchema,
} from "@backtrade/types";
import authController from "../../../controllers/auth-controller";

const authPublicRouter = Router();

authPublicRouter.post(
    "/login",
    inputValidations(LoginRequestSchema),
    authController.login
);

authPublicRouter.post(
    "/refresh-token",
    inputValidations(RefreshTokenRequestSchema),
    authController.refreshToken
);

authPublicRouter.post(
    "/register",
    inputValidations(RegisterRequestSchema),
    authController.register
);

export default authPublicRouter;
