const { Router } = require("express");

const router = Router();

router.get("/echo", (req, res) => {
  res.json({ query: req.query, now: new Date().toISOString() });
});

module.exports = { router };
