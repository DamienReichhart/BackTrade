import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/echo", (req: Request, res: Response) => {
  res.json({ query: req.query, now: new Date().toISOString() });
});

export { router };
