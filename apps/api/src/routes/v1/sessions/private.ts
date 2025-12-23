import sessionsController from "../../../controllers/sessions-controller";
import inputValidations from "../../../middlewares/input-validations";
import { CreateSessionRequestSchema } from "@backtrade/types";
import { Router } from "express";

const sessionsPrivateRouter = Router();

sessionsPrivateRouter.get(
    "/",
    sessionsController.getAllSessions.bind(sessionsController)
);

sessionsPrivateRouter.post(
    "/",
    inputValidations(CreateSessionRequestSchema),
    sessionsController.createSession.bind(sessionsController)
);

export default sessionsPrivateRouter;
