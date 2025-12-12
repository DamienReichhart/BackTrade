import { Router } from "express";
import datasetsController from "../../../controllers/datasets-controller";
import inputValidations from "../../../middlewares/input-validations";
import { DatasetSchema } from "@backtrade/types";

const datasetsPrivateRouter = Router();

datasetsPrivateRouter.get("/", datasetsController.getAllDatasets);
datasetsPrivateRouter.get("/:id", datasetsController.getDatasetById);
datasetsPrivateRouter.post(
    "/",
    inputValidations(DatasetSchema),
    datasetsController.createDataset
);
datasetsPrivateRouter.put(
    "/:id",
    inputValidations(DatasetSchema),
    datasetsController.updateDataset
);
datasetsPrivateRouter.delete("/:id", datasetsController.deleteDataset);

export default datasetsPrivateRouter;
