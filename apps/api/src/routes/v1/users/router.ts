import { Router } from "express";
import usersController from "../../../controllers/users-controller";

const usersRouter = Router();

usersRouter.get("/:id", usersController.getUserById);

export default usersRouter;