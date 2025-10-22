const { Router } = require("express");

const router = Router();

router.get("/echo", (req: any, res: any) => {
  res.json({ query: req.query, now: new Date().toISOString() });
});

module.exports = { router };
