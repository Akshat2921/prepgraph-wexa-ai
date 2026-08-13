import neo4j from "neo4j-driver";
import "dotenv/config";

const { COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD } = process.env;

if (!COGNODB_URI || !COGNODB_USER || !COGNODB_PASSWORD) {
  console.error(
    "[db] Missing CognoDB connection details. Copy .env.example to .env and fill in COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD."
  );
}

// one driver, reused everywhere. CognoDB is Bolt-compatible so the regular
// neo4j driver just works, no special client needed.
//
// Neo4j returns integers in a special {low, high} format by default to avoid
// precision loss on 64-bit numbers. disableLosslessIntegers converts these to
// plain JS numbers instead, which is what count()/avg() results need to be
// for JSON responses and React to work with. Our data is small enough that
// precision isn't a concern.
export const driver = neo4j.driver(
  COGNODB_URI,
  neo4j.auth.basic(COGNODB_USER, COGNODB_PASSWORD),
  { maxConnectionPoolSize: 20, disableLosslessIntegers: true }
);

// hit this once at startup so a bad .env fails loudly right away instead of
// the first API call just timing out with a vague error
export async function verifyConnection() {
  try {
    await driver.verifyConnectivity();
    console.log("[db] Connected to CognoDB successfully.");
    return true;
  } catch (err) {
    console.error("[db] Could not connect to CognoDB:", err.message);
    return false;
  }
}

// wraps the open-session / run / close-session dance so routes don't have
// to repeat it every time
export async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject());
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  await driver.close();
}
