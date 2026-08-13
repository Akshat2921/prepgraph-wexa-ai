import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Basecamp", end: true },
  { to: "/explorer", label: "Trail Map" },
  { to: "/companies", label: "Target Peaks" },
  { to: "/next-best", label: "Next Trail" },
];

export default function Navbar() {
  return (
    <header className="border-b border-contour">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl text-parchment">PrepGraph</span>
          <span className="font-mono text-[11px] text-muted tracking-wide">v1 · elev. tracker</span>
        </div>
        <nav className="flex gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-contour text-trail"
                    : "text-muted hover:text-parchment"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
