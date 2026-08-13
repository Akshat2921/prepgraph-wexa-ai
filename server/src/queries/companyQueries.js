export const getAllCompanies = `
  MATCH (c:Company)
  RETURN c.name AS name, c.industry AS industry
  ORDER BY c.name
`;

// this is the one that's genuinely annoying in SQL - company's focus topics,
// filtered down to where my confidence is low, with the actual problem
// titles attached. that's a 3-table join plus an aggregate filter over there,
// here it's just following the relationships
export const weakTopicsForCompany = `
  MATCH (c:Company {name: $companyName})-[:FOCUSES_ON]->(t:Topic)
  OPTIONAL MATCH (p:Problem)-[:BELONGS_TO]->(t)
  WHERE p.confidenceScore <= 2
  WITH t, collect(p.title) AS weakProblems
  RETURN t.name AS topic, t.category AS category, weakProblems
  ORDER BY size(weakProblems) DESC
`;

export const companyFocusOverview = `
  MATCH (c:Company {name: $companyName})-[:FOCUSES_ON]->(t:Topic)
  OPTIONAL MATCH (p:Problem)-[:BELONGS_TO]->(t)
  RETURN t.name AS topic, count(p) AS problemsSolved, avg(p.confidenceScore) AS avgConfidence
  ORDER BY avgConfidence ASC
`;
