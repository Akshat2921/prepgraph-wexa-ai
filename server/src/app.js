import express from "express";
import cors from "cors";
import "dotenv/config";

import { verifyConnection, closeDriver } from "./db.js";
import topicsRouter from "./routes/topics.js";
import companiesRouter from "./routes/companies.js";
import problemsRouter from "./routes/problems.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const connected = await verifyConnection();
  res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "db_unreachable" });
});

app.use("/api/topics", topicsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/problems", problemsRouter);

// has to go last, otherwise next(err) from the routes above won't reach it
app.use(errorHandler);

const server = app.listen(PORT, async () => {
  console.log(`[server] PrepGraph API listening on port ${PORT}`);
  await verifyConnection();
});

// close the bolt pool properly on shutdown instead of just killing the process
process.on("SIGTERM", async () => {
  await closeDriver();
  server.close(() => process.exit(0));
});
