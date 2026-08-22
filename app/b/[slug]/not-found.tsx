export default function BoardNotFound() {
  return (
    <div className="ob-wash flex min-h-full flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-ob-ink">
        Board not found
      </h1>
      <p className="mt-3 max-w-sm text-base text-ob-mute">
        No outboard lives at this address. Check the slug or claim it on
        outboard.lol.
      </p>
    </div>
  );
}
