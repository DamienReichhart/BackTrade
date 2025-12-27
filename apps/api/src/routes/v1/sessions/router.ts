import { Router } from "express";
import sessionsPrivateRouter from "./private";
import positionsController from "../../../controllers/positions-controller";
import { authMiddleware } from "../../../middlewares/auth-middleware";

const sessionsRouter = Router();

// Nested route for positions by session - must be registered before /:id route
sessionsRouter.get(
    "/:sessionId/positions",
    authMiddleware,
    positionsController.getPositionsBySession.bind(positionsController)
);

sessionsRouter.use("/", authMiddleware, sessionsPrivateRouter);

export default sessionsRouter;
