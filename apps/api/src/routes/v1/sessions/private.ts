import sessionsController from "../../../controllers/sessions-controller";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreateSessionRequestSchema,
    UpdateSessionRequestSchema,
} from "@backtrade/types";
import { Router } from "express";

const sessionsPrivateRouter = Router();

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

sessionsPrivateRouter.delete(
    "/:id",
    sessionsController.deleteSession.bind(sessionsController)
);

export default sessionsPrivateRouter;
