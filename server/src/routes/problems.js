import { Router } from "express";
import { runQuery } from "../db.js";
import {
  getProblemsByTopic,
  similarByPattern,
  getProblemDetail,
} from "../queries/problemQueries.js";

const router = Router();

router.get("/by-topic/:topicName", async (req, res, next) => {
  try {
    const rows = await runQuery(getProblemsByTopic, { topicName: req.params.topicName });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:title/detail", async (req, res, next) => {
  try {
    const rows = await runQuery(getProblemDetail, { problemTitle: req.params.title });
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

router.get("/:title/similar", async (req, res, next) => {
  try {
    const rows = await runQuery(similarByPattern, { problemTitle: req.params.title });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
