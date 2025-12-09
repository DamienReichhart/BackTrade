import type { Request, Response } from "express";
import usersService from "../services/base/users-service";
import { logger } from "../libs/logger/pino";

const usersControllerLogger = logger.child({
    service: "users-controller",
});

async function getUserById(req: Request, res: Response) {
    const { id } = req.params;
    usersControllerLogger.debug({ id }, "Getting user by ID");
    const user = await usersService.getUserById(Number(id));
    return res.status(200).json(user);
}

export default {
    getUserById,
};
