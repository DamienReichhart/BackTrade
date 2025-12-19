import { Router } from "express";
import datasetsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { adminMiddleware } from "../../../middlewares/admin-middleware";

const datasetsRouter = Router();

datasetsRouter.use("/", authMiddleware, adminMiddleware, datasetsPrivateRouter);

export default datasetsRouter;
