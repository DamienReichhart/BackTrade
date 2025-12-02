import type { Request, Response } from "express";
import authService from "../services/security/auth-service";
import type { LoginRequest } from "@backtrade/types";

async function login(req: Request, res: Response) {
  const authResponse = await authService.login(
    req.validatedInput as LoginRequest,
  );
  res.status(200).json(authResponse);
}

export default {
  login,
};
