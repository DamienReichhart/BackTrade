import { Router } from "express";

export const router = Router();

router.get("/echo", (req, res) => {
  res.json({ query: req.query, now: new Date().toISOString() });
});
