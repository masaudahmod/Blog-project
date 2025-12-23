export default function Loading() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-md bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
