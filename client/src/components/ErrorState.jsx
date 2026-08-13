export default function ErrorState({ error, onRetry }) {
  const isDbDown = error?.status === 503 || error?.status === 0;
  return (
    <div className="text-center py-16 border border-rust/40 bg-rust/5 rounded-lg">
      <p className="font-display text-lg text-rust mb-1">
        {isDbDown ? "PrepGraph can't reach the database" : "Something went wrong"}
      </p>
      <p className="text-muted text-sm max-w-md mx-auto">
        {isDbDown
          ? "The CognoDB instance may be paused or the connection details in the server's .env are incorrect. Check the console instance status and try again."
          : error?.message || "That request didn't go through. Try again in a moment."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 text-sm border border-contour rounded text-parchment hover:border-trail hover:text-trail transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
