export const getProblemsByTopic = `
  MATCH (p:Problem)-[:BELONGS_TO]->(t:Topic {name: $topicName})
  OPTIONAL MATCH (p)-[:USES_PATTERN]->(pat:Pattern)
  RETURN p.title AS title, p.difficulty AS difficulty, p.platform AS platform,
         p.url AS url, p.confidenceScore AS confidenceScore, collect(pat.name) AS patterns
  ORDER BY p.difficulty
`;

// finds problems connected purely through a shared pattern, even across
// different topics - e.g. two DFS-backtracking problems that don't look
// related on the surface at all
export const similarByPattern = `
  MATCH (p1:Problem {title: $problemTitle})-[:USES_PATTERN]->(pat:Pattern)<-[:USES_PATTERN]-(p2:Problem)
  WHERE p1 <> p2
  RETURN DISTINCT p2.title AS relatedProblem, p2.difficulty AS difficulty, pat.name AS sharedPattern
`;

export const getProblemDetail = `
  MATCH (p:Problem {title: $problemTitle})
  OPTIONAL MATCH (p)-[:BELONGS_TO]->(t:Topic)
  OPTIONAL MATCH (p)-[:USES_PATTERN]->(pat:Pattern)
  OPTIONAL MATCH (p)-[:SIMILAR_TO]->(sim:Problem)
  RETURN p.title AS title, p.difficulty AS difficulty, p.platform AS platform,
         p.url AS url, p.confidenceScore AS confidenceScore,
         t.name AS topic, collect(DISTINCT pat.name) AS patterns,
         collect(DISTINCT sim.title) AS similarProblems
`;
