import sessionsController from "../../../controllers/sessions-controller";
import { Router } from "express";

const sessionsPrivateRouter = Router();

sessionsPrivateRouter.get(
    "/",
    sessionsController.getAllSessions.bind(sessionsController)
);

export default sessionsPrivateRouter;
