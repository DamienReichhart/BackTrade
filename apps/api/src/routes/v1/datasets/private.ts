import { Router } from "express";
import datasetsController from "../../../controllers/datasets-controller";
import inputValidations from "../../../middlewares/input-validations";
import { uploadDatasetFile } from "../../../middlewares/file-upload";
import {
    CreateDatasetRequestSchema,
    UpdateDatasetRequestSchema,
} from "@backtrade/types";

const datasetsPrivateRouter = Router();

datasetsPrivateRouter.get(
    "/",
    datasetsController.getAllDatasets.bind(datasetsController)
);

datasetsPrivateRouter.get(
    "/:id",
    datasetsController.getDatasetById.bind(datasetsController)
);

datasetsPrivateRouter.post(
    "/",
    inputValidations(CreateDatasetRequestSchema),
    datasetsController.createDataset.bind(datasetsController)
);

datasetsPrivateRouter.put(
    "/:id",
    inputValidations(UpdateDatasetRequestSchema),
    datasetsController.updateDataset.bind(datasetsController)
);

datasetsPrivateRouter.patch(
    "/:id",
    inputValidations(UpdateDatasetRequestSchema),
    datasetsController.updateDataset.bind(datasetsController)
);

datasetsPrivateRouter.delete(
    "/:id",
    datasetsController.deleteDataset.bind(datasetsController)
);

datasetsPrivateRouter.post(
    "/:id/file",
    uploadDatasetFile,
    datasetsController.uploadFile.bind(datasetsController)
);

export default datasetsPrivateRouter;
