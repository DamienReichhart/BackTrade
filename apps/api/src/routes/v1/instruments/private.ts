import instrumentController from "../../../controllers/instruments-controller";
import inputValidations from "../../../middlewares/input-validations";
import {
    CreateInstrumentRequestSchema,
    UpdateInstrumentRequestSchema,
} from "@backtrade/types";
import { Router } from "express";

const instrumentsPrivateRouter = Router();

instrumentsPrivateRouter.get("/", instrumentController.getAllInstruments);

instrumentsPrivateRouter.get("/:id", instrumentController.getInstrumentById);

instrumentsPrivateRouter.post(
    "/",
    inputValidations(CreateInstrumentRequestSchema),
    instrumentController.createInstrument
);

instrumentsPrivateRouter.put(
    "/:id",
    inputValidations(UpdateInstrumentRequestSchema),
    instrumentController.updateInstrument
);

instrumentsPrivateRouter.patch(
    "/:id",
    inputValidations(UpdateInstrumentRequestSchema),
    instrumentController.updateInstrument
);

instrumentsPrivateRouter.delete("/:id", instrumentController.deleteInstrument);

export default instrumentsPrivateRouter;
