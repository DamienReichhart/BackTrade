import { Router } from "express";
import healthRouter from "./health/router";
import usersRouter from "./users/router";

const apiV1Router = Router();

apiV1Router.use("/health", healthRouter);
apiV1Router.use("/users", usersRouter);

export default apiV1Router;