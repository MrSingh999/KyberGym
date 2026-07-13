import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card, CardContent } from "../ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  loading,
  className,
  ...props 
}: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted">{title}</p>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-primary">
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-surface-hover" />
          ) : (
            <h2 className="text-3xl font-heading font-bold tracking-tight text-primary">
              {value}
            </h2>
          )}
        </div>

        {(trend !== undefined || trendLabel) && (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            {isPositive && <TrendingUp className="h-4 w-4 text-success" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-error" />}
            
            <span
              className={cn(
                "font-medium",
                isPositive ? "text-success" : isNegative ? "text-error" : "text-muted"
              )}
            >
              {trend !== undefined && `${trend > 0 ? "+" : ""}${trend}%`}
            </span>
            {trendLabel && <span className="text-muted ml-1">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
