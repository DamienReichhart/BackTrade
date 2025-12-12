import instrumentController from "../../../controllers/instrument-controller";
import inputValidations from "../../../middlewares/input-validations";
import { InstrumentSchema } from "@backtrade/types";
import { Router } from "express";

const instrumentsPrivateRouter = Router();

instrumentsPrivateRouter.get("/", instrumentController.getAllInstruments);
instrumentsPrivateRouter.get("/:id", instrumentController.getInstrumentById);
instrumentsPrivateRouter.post(
    "/",
    inputValidations(InstrumentSchema),
    instrumentController.createInstrument
);
instrumentsPrivateRouter.put(
    "/:id",
    inputValidations(InstrumentSchema),
    instrumentController.updateInstrument
);
instrumentsPrivateRouter.delete("/:id", instrumentController.deleteInstrument);

export default instrumentsPrivateRouter;
