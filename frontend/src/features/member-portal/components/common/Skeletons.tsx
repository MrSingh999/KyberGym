export function CardSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 bg-border-default/60 rounded w-1/4 animate-pulse" />
        <div className="h-5 bg-border-default/60 rounded-full w-16 animate-pulse" />
      </div>
      <div className="h-6 bg-border-default/60 rounded w-1/2 mb-3 animate-pulse" />
      <div className="h-4 bg-border-default/60 rounded w-3/4 animate-pulse" />
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4">
      <div className="h-3.5 bg-border-default/60 rounded w-1/3 mb-3 animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-14 bg-border-default/40 rounded-lg animate-pulse" />
        <div className="h-14 bg-border-default/40 rounded-lg animate-pulse" />
        <div className="h-14 bg-border-default/40 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4">
      <div className="h-3.5 bg-border-default/60 rounded w-1/3 mb-4 animate-pulse" />
      <div className="space-y-3">
        <div className="h-12 bg-border-default/40 rounded-lg animate-pulse" />
        <div className="h-12 bg-border-default/40 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
