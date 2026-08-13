// catches whatever gets passed to next(err) from the routes. mainly here so
// we can tell "db is down" apart from "something actually broke" - the UI
// shows different messages for those
export function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);

  const isDbError =
    err.code === "ServiceUnavailable" ||
    err.name === "Neo4jError" ||
    /ECONNREFUSED|getaddrinfo|connect|routing/i.test(err.message || "");

  if (isDbError) {
    return res.status(503).json({
      error: "database_unreachable",
      message:
        "PrepGraph can't reach the CognoDB instance right now. Check that the instance is running and the connection details in .env are correct.",
    });
  }

  return res.status(500).json({
    error: "internal_error",
    message: "Something went wrong while processing that request.",
  });
}
