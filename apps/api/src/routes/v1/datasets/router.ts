import { Router } from "express";
import datasetsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const datasetsRouter = Router();

datasetsRouter.use("/", authMiddleware, datasetsPrivateRouter);

export default datasetsRouter;
