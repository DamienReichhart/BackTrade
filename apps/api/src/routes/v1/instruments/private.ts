import instrumentController from "../../../controllers/instruments-controller";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreateInstrumentRequestSchema,
    UpdateInstrumentRequestSchema,
} from "@backtrade/types";
import { Router } from "express";

const instrumentsPrivateRouter = Router();

instrumentsPrivateRouter.get(
    "/",
    instrumentController.getAllInstruments.bind(instrumentController)
);

instrumentsPrivateRouter.get(
    "/:id",
    instrumentController.getInstrumentById.bind(instrumentController)
);

instrumentsPrivateRouter.post(
    "/",
    inputValidations(CreateInstrumentRequestSchema),
    instrumentController.createInstrument.bind(instrumentController)
);

instrumentsPrivateRouter.put(
    "/:id",
    inputValidations(UpdateInstrumentRequestSchema),
    instrumentController.updateInstrument.bind(instrumentController)
);

instrumentsPrivateRouter.patch(
    "/:id",
    inputValidations(UpdateInstrumentRequestSchema),
    instrumentController.updateInstrument.bind(instrumentController)
);

instrumentsPrivateRouter.delete(
    "/:id",
    instrumentController.deleteInstrument.bind(instrumentController)
);

export default instrumentsPrivateRouter;
