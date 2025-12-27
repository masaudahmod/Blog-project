export default function Loading() {
  return (
    <div className="p-4">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse mx-auto mb-4" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
          >
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-4">
              {/* Title Line */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>

              {/* Excerpt Lines */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
              </div>

              {/* Meta Info Skeletons */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>

              {/* Footer Skeleton */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between mt-6">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
