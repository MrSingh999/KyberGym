import * as React from "react";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";
import { Skeleton } from "../feedback/Skeleton";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  iconClassName,
  loading,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-border-hover bg-surface/40 p-4 card-hover group flex flex-col gap-2.5 min-h-[96px]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs",
              iconClassName || "bg-primary/10 text-primary",
            )}
          >
            {icon}
          </div>
        )}
        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans leading-tight">
          {title}
        </span>
      </div>
      <div className="flex items-center leading-none">
        {loading ? (
          <Skeleton className="h-6 w-20 rounded" />
        ) : (
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-mono tracking-tight leading-none">
            {value}
          </h3>
        )}
      </div>
    </Card>
  );
}
