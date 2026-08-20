export default function AdminLoading() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-zinc-200" />
          <div className="h-8 w-56 rounded bg-zinc-200" />
          <div className="h-4 w-72 max-w-full rounded bg-zinc-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-1/3 rounded bg-zinc-200" />
              <div className="mt-4 h-8 w-1/2 rounded bg-zinc-200" />
              <div className="mt-3 h-3 w-2/3 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
