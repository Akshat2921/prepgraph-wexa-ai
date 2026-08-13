import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function ProblemDetail() {
  const { title } = useParams();
  const [detail, setDetail] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setDetail(null);
    setSimilar(null);
    Promise.all([api.getProblemDetail(title), api.getSimilarProblems(title)])
      .then(([d, s]) => {
        setDetail(d);
        setSimilar(s);
      })
      .catch(setError);
  }

  useEffect(load, [title]);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!detail) return <LoadingState label="Pulling up this problem" />;
  if (!detail.title)
    return <EmptyState title="Problem not found" body={`No problem named "${title}" is charted in the graph.`} />;

  return (
    <div>
      <Link to="/explorer" className="font-mono text-xs text-muted hover:text-trail mb-6 inline-block">
        ← back to trail map
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs text-trail tracking-widest uppercase mb-2">
          {detail.topic || "Unfiled"}
        </p>
        <h1 className="font-display text-2xl text-parchment mb-2">{detail.title}</h1>
        <div className="flex gap-3 items-center font-mono text-xs text-muted">
          <span>{detail.platform}</span>
          <span>·</span>
          <span>{detail.difficulty}</span>
          <span>·</span>
          <span>confidence {detail.confidenceScore}/5</span>
        </div>
      </div>

      {detail.patterns?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-muted mb-2">Patterns used</p>
          <div className="flex flex-wrap gap-2">
            {detail.patterns.map((p) => (
              <span key={p} className="px-3 py-1 rounded-full border border-contour text-xs text-summit">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border border-contour rounded-lg p-5 bg-panel/50 mb-6">
        <h2 className="font-display text-lg text-parchment mb-1">Related through shared patterns</h2>
        <p className="text-xs text-muted mb-4">
          Problems that share a pattern with this one, even from a different topic — the kind of
          connection a graph surfaces naturally.
        </p>
        {!similar ? (
          <LoadingState label="Cross-referencing patterns" />
        ) : similar.length === 0 ? (
          <EmptyState title="No pattern-linked problems yet" body="This problem doesn't share a charted pattern with anything else yet." />
        ) : (
          <ul className="space-y-2">
            {similar.map((s) => (
              <li key={s.relatedProblem} className="flex items-center justify-between text-sm">
                <Link to={`/problems/${encodeURIComponent(s.relatedProblem)}`} className="text-parchment hover:text-trail">
                  {s.relatedProblem}
                </Link>
                <span className="font-mono text-[10px] text-muted">
                  {s.difficulty} · via {s.sharedPattern}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {detail.similarProblems?.length > 0 && (
        <div className="border border-contour rounded-lg p-5 bg-panel/50">
          <h2 className="font-display text-lg text-parchment mb-3">Marked as similar variant</h2>
          <ul className="space-y-2">
            {detail.similarProblems.map((s) => (
              <li key={s}>
                <Link to={`/problems/${encodeURIComponent(s)}`} className="text-sm text-parchment hover:text-trail">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
