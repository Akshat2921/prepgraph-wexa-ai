import { Router } from "express";
import { runQuery } from "../db.js";
import {
  getAllTopicsWithProgress,
  prerequisitePath,
  topicNeighbors,
  fullTopicGraph,
  nextBestTopics,
} from "../queries/topicQueries.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const rows = await runQuery(getAllTopicsWithProgress);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/graph", async (req, res, next) => {
  try {
    const rows = await runQuery(fullTopicGraph);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/next-best", async (req, res, next) => {
  try {
    const rows = await runQuery(nextBestTopics);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:name/neighbors", async (req, res, next) => {
  try {
    const rows = await runQuery(topicNeighbors, { topicName: req.params.name });
    res.json(rows[0] || { topic: req.params.name, prerequisites: [], unlocks: [] });
  } catch (err) {
    next(err);
  }
});

// e.g. GET /api/topics/path?from=Arrays&to=Segment%20Trees
router.get("/path", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "bad_request", message: "Both 'from' and 'to' query params are required." });
    }
    const rows = await runQuery(prerequisitePath, { startTopic: from, targetTopic: to });
    res.json(rows[0] || { topicOrder: [], hops: 0 });
  } catch (err) {
    next(err);
  }
});

export default router;
