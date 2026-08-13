export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 py-16 justify-center text-muted font-mono text-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trail opacity-60"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-trail"></span>
      </span>
      {label}…
    </div>
  );
}
