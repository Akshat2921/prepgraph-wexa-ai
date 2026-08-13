// wipes the graph and rebuilds it from data.json every time it runs, so it's
// always safe to re-run without ending up with duplicate nodes. uses MERGE
// for most things (in case I ever change this to not wipe first), CREATE for
// the interview session logs since there's nothing to conflict with right
// after a fresh wipe
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import "dotenv/config";
import { driver, closeDriver, verifyConnection } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(__dirname, "data.json"), "utf-8"));

async function run(session, cypher, params = {}) {
  await session.run(cypher, params);
}

async function seed() {
  const ok = await verifyConnection();
  if (!ok) {
    console.error("[seed] Aborting — cannot reach CognoDB. Check your .env values.");
    process.exit(1);
  }

  const session = driver.session();
  try {
    console.log("[seed] Clearing existing graph (fresh demo state)...");
    await run(session, "MATCH (n) DETACH DELETE n");

    console.log(`[seed] Creating ${data.topics.length} Topic nodes...`);
    for (const t of data.topics) {
      await run(
        session,
        `MERGE (t:Topic {name: $name}) SET t.category = $category, t.difficultyTier = $difficultyTier`,
        t
      );
    }

    console.log(`[seed] Creating ${data.prerequisites.length} PREREQUISITE_OF relationships...`);
    for (const [from, to] of data.prerequisites) {
      await run(
        session,
        `MATCH (a:Topic {name: $from}), (b:Topic {name: $to})
         MERGE (a)-[:PREREQUISITE_OF]->(b)`,
        { from, to }
      );
    }

    console.log(`[seed] Creating ${data.patterns.length} Pattern nodes...`);
    for (const name of data.patterns) {
      await run(session, `MERGE (:Pattern {name: $name})`, { name });
    }

    console.log(`[seed] Creating ${data.companies.length} Company nodes + FOCUSES_ON edges...`);
    for (const c of data.companies) {
      await run(session, `MERGE (c:Company {name: $name}) SET c.industry = $industry`, c);
      for (const topic of c.focusTopics) {
        await run(
          session,
          `MATCH (c:Company {name: $name}), (t:Topic {name: $topic})
           MERGE (c)-[:FOCUSES_ON]->(t)`,
          { name: c.name, topic }
        );
      }
    }

    console.log(`[seed] Creating ${data.problems.length} Problem nodes + relationships...`);
    for (const p of data.problems) {
      await run(
        session,
        `MERGE (p:Problem {title: $title})
         SET p.difficulty = $difficulty, p.platform = $platform, p.confidenceScore = $confidenceScore
         WITH p
         MATCH (t:Topic {name: $topic})
         MERGE (p)-[:BELONGS_TO]->(t)`,
        p
      );
      for (const pattern of p.patterns) {
        await run(
          session,
          `MATCH (p:Problem {title: $title}), (pat:Pattern {name: $pattern})
           MERGE (p)-[:USES_PATTERN]->(pat)`,
          { title: p.title, pattern }
        );
      }
    }

    console.log(`[seed] Creating ${data.similarProblems.length} SIMILAR_TO relationships...`);
    for (const [a, b] of data.similarProblems) {
      await run(
        session,
        `MATCH (p1:Problem {title: $a}), (p2:Problem {title: $b})
         MERGE (p1)-[:SIMILAR_TO]->(p2)
         MERGE (p2)-[:SIMILAR_TO]->(p1)`,
        { a, b }
      );
    }

    console.log(`[seed] Creating ${data.interviewSessions.length} InterviewSession nodes...`);
    for (const s of data.interviewSessions) {
      await run(
        session,
        `CREATE (s:InterviewSession {date: $date, round: $round, outcome: $outcome, notes: $notes})
         WITH s
         UNWIND $toppedTopics AS topicName
         MATCH (t:Topic {name: topicName})
         MERGE (s)-[:TESTED]->(t)`,
        s
      );
    }

    console.log("[seed] Done. Graph seeded successfully.");
  } catch (err) {
    console.error("[seed] Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed();
