import * as React from "react";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";
import { Skeleton } from "../feedback/Skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconClassName,
  loading,
  trend,
  trendType,
  subtitle,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 bg-surface/80 backdrop-blur-xs border border-border-default/80 p-3.5 sm:p-4 lg:p-5 rounded-2xl hover:border-border-hover hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between gap-3 min-h-[104px] sm:min-h-[116px]",
        className,
      )}
      {...props}
    >
      {/* Top row: Icon housing & Title/Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs",
                iconClassName || "bg-primary/10 text-primary border border-primary/20",
              )}
            >
              {icon}
            </div>
          )}
          <span className="block text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider font-mono leading-tight truncate">
            {title}
          </span>
        </div>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0",
              trendType === "up" && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
              trendType === "down" && "bg-red-500/10 text-red-500 border border-red-500/20",
              (!trendType || trendType === "neutral") && "bg-surface-hover text-text-muted border border-border-default",
            )}
          >
            {trendType === "up" && <TrendingUp className="w-3 h-3" />}
            {trendType === "down" && <TrendingDown className="w-3 h-3" />}
            {trendType === "neutral" && <Minus className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Main Metric Value & Subtitle */}
      <div className="flex flex-col gap-0.5">
        {loading ? (
          <Skeleton className="h-7 sm:h-8 w-24 rounded-lg" />
        ) : (
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary font-mono tracking-tight leading-none group-hover:text-primary transition-colors">
            {value}
          </h3>
        )}

        {subtitle && (
          <span className="text-[10px] sm:text-xs text-text-muted font-mono truncate">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}

