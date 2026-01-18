export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-10">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="space-y-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-[220px] rounded-2xl bg-slate-200 dark:bg-slate-800 sm:h-[320px]" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-10 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-4 animate-pulse">
                <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-3">
                  <div className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-3/5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
