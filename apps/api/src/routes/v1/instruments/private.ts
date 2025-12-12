import instrumentController from "../../../controllers/instrument-controller";
import { Router } from "express";

const instrumentsPrivateRouter = Router();

instrumentsPrivateRouter.get("/", instrumentController.getAllInstruments);
instrumentsPrivateRouter.get("/:id", instrumentController.getInstrumentById);
instrumentsPrivateRouter.post("/", instrumentController.createInstrument);
instrumentsPrivateRouter.put("/:id", instrumentController.updateInstrument);
instrumentsPrivateRouter.delete("/:id", instrumentController.deleteInstrument);

export default instrumentsPrivateRouter;
