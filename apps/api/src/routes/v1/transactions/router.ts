import { Router } from "express";
import transactionsPrivateRouter from "./private";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const transactionsRouter = Router();

transactionsRouter.use("/", authMiddleware, transactionsPrivateRouter);

export default transactionsRouter;
