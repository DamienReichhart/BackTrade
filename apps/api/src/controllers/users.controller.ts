import type { Request, Response } from "express";
import usersService from "../services/crud/users.service";
import { logger } from "../libs/pino";
import WebError from "../errors/web/web-error";

const usersControllerLogger = logger.child({
  service: "users-controller",
});

async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  usersControllerLogger.debug({ id }, "Getting user by ID");
  try {
      const user = await usersService.getUserById(Number(id));
      return res.status(200).json(user);
  } catch (err) {
    usersControllerLogger.error({ err }, "Error getting user by ID");
    if (err instanceof WebError) {
      return res.status(err.code).json({ message: err.message });
    }
    throw err;
  }
}

export default {
  getUserById,
};
