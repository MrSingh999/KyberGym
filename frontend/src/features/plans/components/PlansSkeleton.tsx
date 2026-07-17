import { Skeleton } from '@/components/feedback/Skeleton';

function PlanCardSkeleton() {
  return (
    <div className="bg-surface border border-border-default rounded-2xl overflow-hidden">
      <div className="h-1 bg-border-default" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between pt-3 border-t border-border-default">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border-default">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-16 ml-auto" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-8" />
    </div>
  );
}

interface PlansSkeletonProps {
  mode?: 'card' | 'table';
  count?: number;
}

export function PlansSkeleton({ mode = 'card', count = 6 }: PlansSkeletonProps) {
  if (mode === 'table') {
    return (
      <div className="rounded-xl border border-border-default overflow-hidden bg-surface">
        {Array.from({ length: count }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PlanCardSkeleton key={i} />
      ))}
    </div>
  );
}
