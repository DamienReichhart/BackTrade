import transactionsController from "../../../controllers/transactions-controller";
import inputValidations from "../../../middlewares/input-validations";
import { CreateTransactionRequestSchema } from "@backtrade/types";
import { Router } from "express";

const transactionsPrivateRouter = Router();

transactionsPrivateRouter.get(
    "/",
    transactionsController.getAllTransactions.bind(transactionsController)
);

transactionsPrivateRouter.get(
    "/:id",
    transactionsController.getTransactionById.bind(transactionsController)
);

transactionsPrivateRouter.post(
    "/",
    inputValidations(CreateTransactionRequestSchema),
    transactionsController.createTransaction.bind(transactionsController)
);

export default transactionsPrivateRouter;
