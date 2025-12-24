export default function PostSkeleton() {
  return (
    <div className="min-w-full mx-auto p-6 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>

      {/* Featured Image */}
      <div className="h-64 bg-slate-300 dark:bg-slate-700 rounded"></div>

      {/* Meta info */}
      <div className="flex gap-4">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-24"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-16"></div>
      </div>

      {/* Excerpt */}
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>

      {/* Content lines */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-11/12"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-10/12"></div>
      </div>
    </div>
  );
}
