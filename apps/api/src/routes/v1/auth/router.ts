import { Router } from "express";
import authPublicRouter from "./public";

const authRouter = Router();

authRouter.use(authPublicRouter);

export default authRouter;
