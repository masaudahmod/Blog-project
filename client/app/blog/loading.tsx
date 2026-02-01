export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-slate-900 ">
      <div className="container mx-auto">
        <div className="w-full px-4 pb-16 pt-10 lg:px-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-48 rounded bg-slate-200 " />
            <div className="h-8 w-80 rounded bg-slate-200 " />
            <div className="h-4 w-full max-w-2xl rounded bg-slate-200 " />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-6">
              <div className="h-72 w-full rounded-2xl bg-slate-200 " />
              <div className="grid gap-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`post-skeleton-${index}`}
                    className="h-48 rounded-2xl bg-slate-200 "
                  />
                ))}
              </div>
            </main>

            <aside className="space-y-6">
              <div className="h-56 rounded-2xl bg-slate-200 " />
              <div className="h-40 rounded-2xl bg-slate-200 " />
              <div className="h-52 rounded-2xl bg-slate-200 " />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
