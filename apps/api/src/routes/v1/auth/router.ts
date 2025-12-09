import { Router } from "express";
import authPublicRouter from "./public";
import authProtectedRouter from "./protected";

const authRouter = Router();

authRouter.use(authPublicRouter);
authRouter.use(authProtectedRouter);

export default authRouter;
