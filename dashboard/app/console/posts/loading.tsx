export default function Loading() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-md bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
