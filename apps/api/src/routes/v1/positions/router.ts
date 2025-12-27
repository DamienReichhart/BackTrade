import { Router } from "express";
import positionsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const positionsRouter = Router();

positionsRouter.use("/", authMiddleware, positionsPrivateRouter);

export default positionsRouter;
