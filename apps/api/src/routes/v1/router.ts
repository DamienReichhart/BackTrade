import { Router } from "express";
import healthRouter from "./health/router";
import usersRouter from "./users/router";
import authRouter from "./auth/router";

const apiV1Router = Router();

apiV1Router.use("/health", healthRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/auth", authRouter);

export default apiV1Router;
