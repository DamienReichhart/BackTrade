import positionsController from "../../../controllers/positions-controller";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreatePositionRequestSchema,
    UpdatePositionRequestSchema,
} from "@backtrade/types";
import { Router } from "express";

const positionsPrivateRouter = Router();

positionsPrivateRouter.get(
    "/",
    positionsController.getAllPositions.bind(positionsController)
);

positionsPrivateRouter.get(
    "/:id",
    positionsController.getPositionById.bind(positionsController)
);

positionsPrivateRouter.post(
    "/",
    inputValidations(CreatePositionRequestSchema),
    positionsController.createPosition.bind(positionsController)
);

positionsPrivateRouter.put(
    "/:id",
    inputValidations(UpdatePositionRequestSchema),
    positionsController.updatePosition.bind(positionsController)
);

positionsPrivateRouter.patch(
    "/:id",
    inputValidations(UpdatePositionRequestSchema),
    positionsController.updatePosition.bind(positionsController)
);

positionsPrivateRouter.delete(
    "/:id",
    positionsController.deletePosition.bind(positionsController)
);

export default positionsPrivateRouter;
