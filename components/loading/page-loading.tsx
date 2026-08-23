import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageLoading({
  cards = 0,
  rows = 3,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div>
        <Skeleton className="h-3 w-20 rounded-sm" />
        <Skeleton className="mt-3 h-9 w-56 max-w-full rounded-md" />
        <Skeleton className="mt-4 h-4 w-full max-w-md rounded-md" />
      </div>
      {cards > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[1rem]" />
          ))}
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-[1rem]" />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </main>
  );
}

export function LandingPageLoading() {
  return (
    <main className="flex flex-1 flex-col" aria-busy="true" aria-live="polite">
      <section className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-4 pb-16 pt-10 sm:px-8 sm:pb-28 sm:pt-24">
        <Skeleton className="h-16 w-56 rounded-md sm:h-20 sm:w-72" />
        <Skeleton className="mt-8 h-10 w-full max-w-xl rounded-md sm:h-12" />
        <Skeleton className="mt-5 h-5 w-full max-w-lg rounded-md" />
        <Skeleton className="mt-8 h-12 w-full max-w-xl rounded-full" />
        <Skeleton className="mt-14 h-64 w-full max-w-3xl rounded-[1rem] sm:h-80" />
      </section>
      <span className="sr-only">Loading</span>
    </main>
  );
}

export function GuidePageLoading() {
  return (
    <main
      className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 py-16 sm:px-8 sm:py-24"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-3 w-16 rounded-sm" />
      <Skeleton className="mt-4 h-10 w-72 max-w-full rounded-md" />
      <Skeleton className="mt-4 h-4 w-full rounded-md" />
      <Skeleton className="mt-2 h-4 w-5/6 rounded-md" />
      <Skeleton className="mt-8 h-24 rounded-[1rem]" />
      <div className="mt-14 space-y-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-10 w-12 rounded-md" />
            <Skeleton className="mt-3 h-6 w-56 max-w-full rounded-md" />
            <Skeleton className="mt-2 h-4 w-full rounded-md" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading guide</span>
    </main>
  );
}

export function BoardPageLoading() {
  return (
    <div
      className="ob-wash flex min-h-full flex-1 flex-col"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="border-b border-ob-line/80">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-7 w-40 max-w-[70%] rounded-md" />
            <Skeleton className="mt-2 h-3 w-36 rounded-sm" />
          </div>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <Skeleton className="h-14 rounded-[1rem]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[1rem]" />
        ))}
      </main>
      <span className="sr-only">Loading board</span>
    </div>
  );
}

export function AuthPageLoading() {
  return (
    <div
      className="ob-wash flex min-h-dvh flex-col items-center justify-center gap-3"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner className="size-6" />
      <p className="text-sm text-ob-mute">Loading…</p>
    </div>
  );
}
