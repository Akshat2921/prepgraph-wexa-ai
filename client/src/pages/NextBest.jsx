import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function NextBest() {
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setRecs(null);
    api.getNextBest().then(setRecs).catch(setError);
  }
  useEffect(load, []);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!recs) return <LoadingState label="Reading the trail ahead" />;

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs text-trail tracking-widest uppercase mb-2">Next Trail</p>
        <h1 className="font-display text-2xl text-parchment mb-2">Where to head next</h1>
        <p className="text-muted text-sm max-w-xl">
          Topics whose every prerequisite you've already mastered (confidence 4+), but that you
          haven't started yet — the natural next step up the mountain.
        </p>
      </div>

      {recs.length === 0 ? (
        <EmptyState
          title="No clear next step yet"
          body="Either everything reachable is already mastered, or your prerequisite graph needs a few more mastered problems to unlock the next tier."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {recs.map((r, i) => (
            <div key={r.topic} className="border border-contour rounded-lg p-5 bg-panel/50 relative">
              <span className="absolute -top-3 left-4 bg-base px-2 font-mono text-[10px] text-trail">
                #{i + 1}
              </span>
              <p className="font-display text-lg text-parchment mb-1">{r.topic}</p>
              <p className="font-mono text-[10px] text-muted mb-3">{r.category}</p>
              <p className="text-xs text-muted mb-1">Unlocked because you mastered:</p>
              <p className="text-sm text-summit">
                {r.prerequisites.length ? r.prerequisites.join(", ") : "It's a starting peak — no prerequisites."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
