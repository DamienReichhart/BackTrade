import sessionsController from "../../../controllers/sessions-controller";
import positionsController from "../../../controllers/positions-controller";
import transactionsController from "../../../controllers/transactions-controller";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreateSessionRequestSchema,
    UpdateSessionRequestSchema,
} from "@backtrade/types";
import { Router } from "express";

const sessionsPrivateRouter = Router();

sessionsPrivateRouter.patch(
    "/:sessionId/positions",
    positionsController.closeAllPositions.bind(positionsController)
);

sessionsPrivateRouter.get(
    "/:sessionId/positions",
    positionsController.getPositionsBySession.bind(positionsController)
);

sessionsPrivateRouter.get(
    "/:sessionId/transactions",
    transactionsController.getTransactionsBySession.bind(transactionsController)
);

sessionsPrivateRouter.get(
    "/:id/candles",
    sessionsController.getSessionCandles.bind(sessionsController)
);

sessionsPrivateRouter.get(
    "/:id/info",
    sessionsController.getSessionInfo.bind(sessionsController)
);

sessionsPrivateRouter.get(
    "/",
    sessionsController.getAllSessions.bind(sessionsController)
);

sessionsPrivateRouter.get(
    "/:id",
    sessionsController.getSessionById.bind(sessionsController)
);

sessionsPrivateRouter.post(
    "/",
    inputValidations(CreateSessionRequestSchema),
    sessionsController.createSession.bind(sessionsController)
);

sessionsPrivateRouter.put(
    "/:id",
    inputValidations(UpdateSessionRequestSchema),
    sessionsController.updateSession.bind(sessionsController)
);

sessionsPrivateRouter.patch(
    "/:id",
    inputValidations(UpdateSessionRequestSchema),
    sessionsController.updateSession.bind(sessionsController)
);

sessionsPrivateRouter.delete(
    "/:id",
    sessionsController.deleteSession.bind(sessionsController)
);

export default sessionsPrivateRouter;
