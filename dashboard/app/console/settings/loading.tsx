export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex gap-8">
        <div className="h-[calc(100vh-12rem)] w-56 shrink-0 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 flex-1 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
