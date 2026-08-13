import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setTopics(null);
    api.getTopics().then(setTopics).catch(setError);
  }

  useEffect(load, []);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!topics) return <LoadingState label="Reading the map" />;
  if (topics.length === 0)
    return (
      <EmptyState
        title="No topics charted yet"
        body="Run the seed script (npm run seed inside /server) to load your prep data into CognoDB."
      />
    );

  const mastered = topics.filter((t) => t.avgConfidence >= 4).length;
  const inProgress = topics.filter((t) => t.avgConfidence > 0 && t.avgConfidence < 4).length;
  const untouched = topics.length - mastered - inProgress;
  const totalProblems = topics.reduce((s, t) => s + t.problemCount, 0);

  const byCategory = topics.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs text-trail tracking-widest uppercase mb-2">Basecamp</p>
        <h1 className="font-display text-3xl text-parchment mb-2">Your prep, mapped as terrain</h1>
        <p className="text-muted max-w-xl">
          Every topic is a peak, every prerequisite a trail between peaks. Summited peaks (sage) are
          topics you've mastered; amber peaks are in progress.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Peaks summited" value={mastered} color="text-summit" />
        <Stat label="On the trail" value={inProgress} color="text-trail" />
        <Stat label="Unclimbed" value={untouched} color="text-muted" />
        <Stat label="Problems logged" value={totalProblems} color="text-parchment" />
      </div>

      <div className="space-y-8">
        {Object.entries(byCategory).map(([category, list]) => (
          <div key={category}>
            <h2 className="font-display text-lg text-parchment mb-3">{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((t) => (
                <div
                  key={t.name}
                  className="border border-contour rounded-lg p-4 bg-panel/50 hover:border-trail/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-parchment text-sm font-medium">{t.name}</span>
                    <span className="font-mono text-[10px] text-muted">T{t.difficultyTier}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-contour overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-trail to-summit"
                      style={{ width: `${Math.min(t.avgConfidence / 5, 1) * 100}%` }}
                    />
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-2">{t.problemCount} problems</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="border border-contour rounded-lg p-4 bg-panel/50">
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="text-muted text-xs mt-1">{label}</p>
    </div>
  );
}
