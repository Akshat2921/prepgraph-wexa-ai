import { useMemo, useState } from "react";

// didn't want to pull in a force-graph lib just for this, so nodes get placed
// by tier on the y-axis (tier 1 at the bottom, tier 5 at the top - like
// elevation) and spread out by category on x. no simulation, positions are
// deterministic which also means the layout doesn't jump around every render
export default function TopicGraph({ topics, edges, onSelectTopic, selected }) {
  const [hovered, setHovered] = useState(null);

  const { positioned, width, height } = useMemo(() => {
    const categories = [...new Set(topics.map((t) => t.category))];
    const tierRows = 5;
    const rowHeight = 100;
    const colWidth = 190;
    const width = Math.max(categories.length * colWidth + 120, 600);
    const height = tierRows * rowHeight + 100;

    const catCounts = {};
    const positioned = topics.map((t) => {
      const catIndex = categories.indexOf(t.category);
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
      const jitterX = (catCounts[t.category] % 2) * 60;
      return {
        ...t,
        x: 90 + catIndex * colWidth + jitterX,
        y: height - 60 - (t.difficultyTier - 1) * rowHeight,
      };
    });
    return { positioned, width, height };
  }, [topics]);

  const posByName = Object.fromEntries(positioned.map((t) => [t.name, t]));

  function nodeColor(t) {
    if (t.avgConfidence >= 4) return "#6FA88A"; // summit — mastered
    if (t.avgConfidence > 0) return "#E8A33D"; // trail — in progress
    return "#3A4A40"; // untouched
  }

  return (
    <div className="overflow-x-auto border border-contour rounded-lg bg-panel/40">
      <svg width={width} height={height} className="min-w-full">
        {edges.map((e, i) => {
          const a = posByName[e.source];
          const b = posByName[e.target];
          if (!a || !b) return null;
          const dimmed = selected && selected !== e.source && selected !== e.target;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#8B9A90"
              strokeWidth="1.2"
              className="trail-dash"
              opacity={dimmed ? 0.15 : 0.55}
            />
          );
        })}

        {positioned.map((t) => (
          <g
            key={t.name}
            transform={`translate(${t.x}, ${t.y})`}
            onClick={() => onSelectTopic(t.name)}
            onMouseEnter={() => setHovered(t.name)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            <circle
              r={selected === t.name ? 11 : 8}
              fill={nodeColor(t)}
              stroke={selected === t.name ? "#EDEAE1" : "transparent"}
              strokeWidth="2"
            />
            <text
              y={-14}
              textAnchor="middle"
              className="fill-parchment font-mono"
              fontSize="10"
              opacity={hovered === t.name || selected === t.name ? 1 : 0.75}
            >
              {t.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
