import { Skeleton } from '../../../../components/feedback/Skeleton';

function PaymentCardSkeleton() {
  return (
    <div className="bg-surface border border-default rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-1.5 items-end flex flex-col">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between pt-3 border-t border-subtle">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-subtle">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-16 ml-auto" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

interface PaymentsSkeletonProps {
  mode?: 'card' | 'table';
  count?: number;
}

export function PaymentsSkeleton({ mode = 'card', count = 6 }: PaymentsSkeletonProps) {
  if (mode === 'table') {
    return (
      <div className="rounded-xl border border-default overflow-hidden bg-surface">
        {Array.from({ length: count }).map((_, i) => <TableRowSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <PaymentCardSkeleton key={i} />)}
    </div>
  );
}
