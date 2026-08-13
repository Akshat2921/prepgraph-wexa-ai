// keeping every query as a named export here instead of inline in the routes -
// makes it way easier to just paste one into the CognoDB console and poke at it
// directly when something's not returning what I expect. everything's
// parameterised, nothing gets string-concatenated in.

export const getAllTopicsWithProgress = `
  MATCH (t:Topic)
  OPTIONAL MATCH (p:Problem)-[:BELONGS_TO]->(t)
  WITH t, count(p) AS problemCount,
       avg(p.confidenceScore) AS avgConfidence
  RETURN t.name AS name, t.category AS category, t.difficultyTier AS difficultyTier,
         problemCount, coalesce(avgConfidence, 0) AS avgConfidence
  ORDER BY t.category, t.difficultyTier
`;

// this is the multi-hop one - variable length path between two topics.
// could go deeper than 6 hops in theory but our graph tops out around
// 4-5 tiers so 6 gives some headroom without letting a bad query run forever
export const prerequisitePath = `
  MATCH path = (start:Topic {name: $startTopic})-[:PREREQUISITE_OF*1..6]->(target:Topic {name: $targetTopic})
  WITH path, length(path) AS hops
  ORDER BY hops ASC
  LIMIT 1
  RETURN [n IN nodes(path) | n.name] AS topicOrder, hops
`;

// just the immediate (1-hop) neighbors, for when you click a single topic
// and want to see what feeds into it / what it unlocks
export const topicNeighbors = `
  MATCH (t:Topic {name: $topicName})
  OPTIONAL MATCH (pre:Topic)-[:PREREQUISITE_OF]->(t)
  OPTIONAL MATCH (t)-[:PREREQUISITE_OF]->(next:Topic)
  RETURN t.name AS topic,
         collect(DISTINCT pre.name) AS prerequisites,
         collect(DISTINCT next.name) AS unlocks
`;

// pulls the whole edge list in one shot so the Trail Map page doesn't have
// to fire off a request per node - the frontend lays these out itself
export const fullTopicGraph = `
  MATCH (a:Topic)-[:PREREQUISITE_OF]->(b:Topic)
  RETURN a.name AS source, b.name AS target
`;

// "what should I study next" - find a topic I haven't touched where every
// prerequisite is already at confidence 4+. basically doing the recommendation
// logic as a graph pattern instead of pulling everything into JS and looping
export const nextBestTopics = `
  MATCH (mastered:Topic)<-[:BELONGS_TO]-(p:Problem)
  WHERE p.confidenceScore >= 4
  WITH collect(DISTINCT mastered.name) AS masteredNames
  MATCH (candidate:Topic)
  WHERE NOT candidate.name IN masteredNames
  OPTIONAL MATCH (pre:Topic)-[:PREREQUISITE_OF]->(candidate)
  WITH candidate, masteredNames, collect(pre.name) AS prereqs
  WHERE ALL(p IN prereqs WHERE p IN masteredNames)
  RETURN candidate.name AS topic, candidate.category AS category, prereqs AS prerequisites
  ORDER BY candidate.difficultyTier ASC
  LIMIT 5
`;
