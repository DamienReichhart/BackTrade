import type { Request, Response } from "express";

export const serializers = {
    req: (req: Request) => ({
      id: req.id ?? "unknown",
      method: req.method,
      url: req.url,
      remoteAddress: req.ip
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode
    }),
    err: (err: Error) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack
    })
  };
  