import { Router } from "express";
import healthRouter from "./health/router";
import usersRouter from "./users/router";
import authRouter from "./auth/router";
import instrumentsRouter from "./instruments/router";
import datasetsRouter from "./datasets/router";
import sessionsRouter from "./sessions/router";

const apiV1Router = Router();

apiV1Router.use("/health", healthRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/auth", authRouter);
apiV1Router.use("/instruments", instrumentsRouter);
apiV1Router.use("/datasets", datasetsRouter);
apiV1Router.use("/sessions", sessionsRouter);

export default apiV1Router;
