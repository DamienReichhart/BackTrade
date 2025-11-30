import { type Request, type Response } from "express";
import healthService from "../services/utils/health.service";

async function getHealth(_req: Request, res: Response) {
  const health = await healthService.getHealth();
  res.status(200).json(health);
}

export default {
  getHealth,
};
