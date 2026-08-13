const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// wrapping fetch here so every page handles errors the same way instead of
// copy-pasting try/catch everywhere
async function request(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch (networkErr) {
    const err = new Error("network_unreachable");
    err.status = 0;
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || "request_failed");
    err.status = res.status;
    err.code = body.error;
    throw err;
  }
  return res.json();
}

export const api = {
  health: () => request("/health"),
  getTopics: () => request("/topics"),
  getTopicGraph: () => request("/topics/graph"),
  getNextBest: () => request("/topics/next-best"),
  getTopicNeighbors: (name) => request(`/topics/${encodeURIComponent(name)}/neighbors`),
  getPrereqPath: (from, to) =>
    request(`/topics/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  getCompanies: () => request("/companies"),
  getWeakTopicsForCompany: (name) => request(`/companies/${encodeURIComponent(name)}/weak-topics`),
  getCompanyFocus: (name) => request(`/companies/${encodeURIComponent(name)}/focus`),
  getProblemsByTopic: (topic) => request(`/problems/by-topic/${encodeURIComponent(topic)}`),
  getProblemDetail: (title) => request(`/problems/${encodeURIComponent(title)}/detail`),
  getSimilarProblems: (title) => request(`/problems/${encodeURIComponent(title)}/similar`),
};
