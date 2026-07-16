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
        "overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-border-hover bg-surface/40 p-3 card-hover group flex  items-center gap-3 min-h-[64px]",
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs",
            iconClassName || "bg-primary/10 text-primary",
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 flex flex-col items-center justify-center">
        <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider font-sans leading-none text-center">
          {title}
        </span>
        <div className="mt-1 flex items-center justify-center leading-none">
          {loading ? (
            <Skeleton className="h-5 w-14 rounded mt-0.5" />
          ) : (
            <h3 className="text-base sm:text-lg font-bold text-text-primary font-mono tracking-tight leading-none text-center">
              {value}
            </h3>
          )}
        </div>
      </div>
    </Card>
  );
}
