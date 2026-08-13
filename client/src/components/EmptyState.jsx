export default function EmptyState({ title = "Nothing charted here yet", body, action }) {
  return (
    <div className="text-center py-16 border border-dashed border-contour rounded-lg">
      <p className="font-display text-lg text-parchment mb-1">{title}</p>
      {body && <p className="text-muted text-sm max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
