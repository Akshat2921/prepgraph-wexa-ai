import { Router } from "express";
import { runQuery } from "../db.js";
import {
  getAllCompanies,
  weakTopicsForCompany,
  companyFocusOverview,
} from "../queries/companyQueries.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const rows = await runQuery(getAllCompanies);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:name/weak-topics", async (req, res, next) => {
  try {
    const rows = await runQuery(weakTopicsForCompany, { companyName: req.params.name });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:name/focus", async (req, res, next) => {
  try {
    const rows = await runQuery(companyFocusOverview, { companyName: req.params.name });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
