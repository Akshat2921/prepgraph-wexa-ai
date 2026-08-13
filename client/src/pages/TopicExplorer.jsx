import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import TopicGraph from "../components/TopicGraph";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function TopicExplorer() {
  const [topics, setTopics] = useState(null);
  const [edges, setEdges] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [neighbors, setNeighbors] = useState(null);
  const [problems, setProblems] = useState(null);

  const [pathFrom, setPathFrom] = useState("");
  const [pathTo, setPathTo] = useState("");
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);

  function load() {
    setError(null);
    Promise.all([api.getTopics(), api.getTopicGraph()])
      .then(([t, e]) => {
        setTopics(t);
        setEdges(e);
      })
      .catch(setError);
  }

  useEffect(load, []);

  useEffect(() => {
    if (!selected) return;
    setNeighbors(null);
    setProblems(null);
    api.getTopicNeighbors(selected).then(setNeighbors).catch(() => {});
    api.getProblemsByTopic(selected).then(setProblems).catch(() => {});
  }, [selected]);

  async function findPath() {
    if (!pathFrom || !pathTo) return;
    setPathError(null);
    setPathResult(null);
    setPathLoading(true);
    try {
      const result = await api.getPrereqPath(pathFrom, pathTo);
      setPathResult(result);
    } catch (err) {
      setPathError(err);
    } finally {
      setPathLoading(false);
    }
  }

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!topics || !edges) return <LoadingState label="Surveying the terrain" />;
  if (topics.length === 0)
    return <EmptyState title="No trail map yet" body="Seed the database first — see README setup steps." />;

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs text-trail tracking-widest uppercase mb-2">Trail Map</p>
        <h1 className="font-display text-2xl text-parchment mb-2">Prerequisite terrain</h1>
        <p className="text-muted text-sm max-w-xl">
          Click any peak to see what leads into it, and what it unlocks next. Elevation = difficulty tier.
        </p>
      </div>

      <TopicGraph topics={topics} edges={edges} selected={selected} onSelectTopic={setSelected} />

      <div className="mt-6 border border-contour rounded-lg p-5 bg-panel/50">
        <h2 className="font-display text-lg text-parchment mb-1">Find a trail</h2>
        <p className="text-xs text-muted mb-4">
          Pick a starting peak and a target peak — this runs the multi-hop prerequisite traversal
          (<code className="font-mono">[:PREREQUISITE_OF*1..6]</code>) directly against CognoDB.
        </p>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="block text-xs text-muted mb-1">From</label>
            <select
              value={pathFrom}
              onChange={(e) => setPathFrom(e.target.value)}
              className="bg-base border border-contour rounded px-3 py-1.5 text-sm text-parchment min-w-[180px]"
            >
              <option value="">Select a topic…</option>
              {topics.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">To</label>
            <select
              value={pathTo}
              onChange={(e) => setPathTo(e.target.value)}
              className="bg-base border border-contour rounded px-3 py-1.5 text-sm text-parchment min-w-[180px]"
            >
              <option value="">Select a topic…</option>
              {topics.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={findPath}
            disabled={!pathFrom || !pathTo || pathLoading}
            className="px-4 py-1.5 text-sm border border-trail text-trail rounded hover:bg-trail/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Find path
          </button>
        </div>

        {pathLoading && <LoadingState label="Tracing the trail" />}
        {pathError && <ErrorState error={pathError} onRetry={findPath} />}
        {pathResult && !pathLoading && (
          pathResult.topicOrder.length === 0 ? (
            <EmptyState
              title="No path found"
              body={`There's no prerequisite chain from "${pathFrom}" to "${pathTo}" in the current graph.`}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {pathResult.topicOrder.map((name, i) => (
                <span key={name} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full border border-summit/50 text-summit text-sm">
                    {name}
                  </span>
                  {i < pathResult.topicOrder.length - 1 && (
                    <span className="text-trail font-mono text-xs">→</span>
                  )}
                </span>
              ))}
              <span className="font-mono text-[10px] text-muted ml-2">({pathResult.hops} hop{pathResult.hops === 1 ? "" : "s"})</span>
            </div>
          )
        )}
      </div>

      {selected && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="border border-contour rounded-lg p-5 bg-panel/50">
            <h3 className="font-display text-lg text-parchment mb-3">{selected}</h3>
            {!neighbors ? (
              <LoadingState label="Checking trailheads" />
            ) : (
              <>
                <p className="text-xs text-muted mb-1">Prerequisites (comes before this)</p>
                <p className="text-sm text-parchment mb-3">
                  {neighbors.prerequisites.length ? neighbors.prerequisites.join(", ") : "None — this is a starting peak."}
                </p>
                <p className="text-xs text-muted mb-1">Unlocks next</p>
                <p className="text-sm text-parchment">
                  {neighbors.unlocks.length ? neighbors.unlocks.join(", ") : "This is currently a summit — nothing charted beyond it."}
                </p>
              </>
            )}
          </div>

          <div className="border border-contour rounded-lg p-5 bg-panel/50">
            <h3 className="font-display text-lg text-parchment mb-3">Problems here</h3>
            {!problems ? (
              <LoadingState label="Pulling problem list" />
            ) : problems.length === 0 ? (
              <EmptyState title="No problems logged" body="Add some to this topic in your seed data." />
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {problems.map((p) => (
                  <li key={p.title} className="flex items-center justify-between text-sm">
                    <Link to={`/problems/${encodeURIComponent(p.title)}`} className="text-parchment hover:text-trail">
                      {p.title}
                    </Link>
                    <span className="font-mono text-[10px] text-muted">{p.difficulty} · {p.confidenceScore}/5</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
