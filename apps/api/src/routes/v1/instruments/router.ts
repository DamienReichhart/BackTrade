import { Router } from "express";
import instrumentsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const instrumentsRouter = Router();

instrumentsRouter.use("/", authMiddleware, instrumentsPrivateRouter);

export default instrumentsRouter;
