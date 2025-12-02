import { Router } from "express";
import inputValidations from "../../../middlewares/input-validations";
import { LoginRequestSchema } from "@backtrade/types";
import authController from "../../../controllers/auth-controller";

const authPublicRouter = Router();

authPublicRouter.post(
  "/login",
  inputValidations(LoginRequestSchema),
  authController.login,
);

export default authPublicRouter;
