import { Router } from "express";
import sessionsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const sessionsRouter = Router();

sessionsRouter.use("/", authMiddleware, sessionsPrivateRouter);

export default sessionsRouter;
