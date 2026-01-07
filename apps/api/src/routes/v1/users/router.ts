import { Router } from "express";
import usersController from "../../../controllers/users-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import inputValidations from "../../../middlewares/input-validations";
import { ChangeUserPasswordRequestSchema } from "@backtrade/types";

const usersRouter = Router();

usersRouter.patch(
    "/:id/password",
    authMiddleware,
    inputValidations(ChangeUserPasswordRequestSchema),
    usersController.changePassword
);

usersRouter.get("/:id", authMiddleware, usersController.getUserById);

export default usersRouter;
