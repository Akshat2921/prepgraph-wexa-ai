import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

export default function CompanyView() {
  const [companies, setCompanies] = useState(null);
  const [selected, setSelected] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    api.getCompanies().then(setCompanies).catch(setError);
  }
  useEffect(load, []);

  useEffect(() => {
    if (!selected) return;
    setWeakTopics(null);
    api.getWeakTopicsForCompany(selected).then(setWeakTopics).catch(setError);
  }, [selected]);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!companies) return <LoadingState label="Scouting target peaks" />;
  if (companies.length === 0)
    return <EmptyState title="No companies charted" body="Add companies to your seed data first." />;

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-xs text-trail tracking-widest uppercase mb-2">Target Peaks</p>
        <h1 className="font-display text-2xl text-parchment mb-2">Prep by company</h1>
        <p className="text-muted text-sm max-w-xl">
          Pick a company to see which of its focus topics you're weakest in — and exactly which
          problems to revise before that interview.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {companies.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelected(c.name)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              selected === c.name
                ? "border-trail text-trail bg-trail/10"
                : "border-contour text-muted hover:text-parchment hover:border-parchment/40"
            }`}
          >
            {c.name}
            <span className="font-mono text-[10px] ml-2 opacity-60">{c.industry}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <h2 className="font-display text-lg text-parchment mb-3">
            Weak spots for {selected}
          </h2>
          {!weakTopics ? (
            <LoadingState label="Checking your footing" />
          ) : weakTopics.length === 0 ? (
            <EmptyState
              title="No weak topics found"
              body="Either this company has no focus topics charted, or you're solid across all of them — nice."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {weakTopics.map((t) => (
                <div key={t.topic} className="border border-contour rounded-lg p-4 bg-panel/50">
                  <p className="text-parchment text-sm font-medium mb-1">{t.topic}</p>
                  <p className="font-mono text-[10px] text-muted mb-2">{t.category}</p>
                  {t.weakProblems.length === 0 ? (
                    <p className="text-xs text-summit">No low-confidence problems here — solid.</p>
                  ) : (
                    <ul className="text-xs text-muted space-y-1">
                      {t.weakProblems.map((p) => (
                        <li key={p}>
                          <Link to={`/problems/${encodeURIComponent(p)}`} className="text-rust hover:text-trail">
                            {p}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
