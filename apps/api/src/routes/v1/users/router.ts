import { Router } from "express";
import usersController from "../../../controllers/users-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { adminMiddleware } from "../../../middlewares/admin-middleware";
import inputValidations from "../../../middlewares/input-validations";
import {
    ChangeUserPasswordRequestSchema,
    UpdateUserRequestSchema,
} from "@backtrade/types";

const usersRouter = Router();

// Admin-only routes
usersRouter.get(
    "/",
    authMiddleware,
    adminMiddleware,
    usersController.getAllUsers.bind(usersController)
);

// Routes requiring authentication (admin or owner)
usersRouter.get(
    "/:id/subscriptions",
    authMiddleware,
    usersController.getUserSubscriptions.bind(usersController)
);

usersRouter.patch(
    "/:id/password",
    authMiddleware,
    inputValidations(ChangeUserPasswordRequestSchema),
    usersController.changePassword
);

usersRouter.patch(
    "/:id",
    authMiddleware,
    inputValidations(UpdateUserRequestSchema),
    usersController.updateUser
);

usersRouter.get("/:id", authMiddleware, usersController.getUserById);

usersRouter.delete(
    "/:id",
    authMiddleware,
    usersController.deleteUserAccount.bind(usersController)
);

export default usersRouter;
