import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-hover", className)}
      {...props}
    />
  );
}

export function TableSkeleton() {
  return (
    <div className="w-full border border-subtle rounded-xl overflow-hidden bg-surface shadow-sm">
      <div className="h-12 border-b border-subtle bg-surface-hover/50 px-4 flex items-center">
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 px-4 border-b border-subtle flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}
