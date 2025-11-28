import { Router } from "express";
import { HealthResponseSchema } from "@backtrade/types";
import healthController from "../../controllers/health.controller";
import { responseValidator } from "../../middlewares/output-validator";

const router = Router();


router.get("/", responseValidator(HealthResponseSchema), healthController.getHealth);

export default router;