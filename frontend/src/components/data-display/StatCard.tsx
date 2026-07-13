import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent } from "../ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  loading,
  className,
  ...props 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-200", className)} {...props}>
      <CardContent className="p-4 flex items-start gap-3">
        {icon && (
          <div className="p-1.5 rounded-[4px] bg-elevated border border-border-default text-text-secondary shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline">
            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-surface-hover" />
            ) : (
              <h3 className="text-xl font-bold text-text-primary font-mono tracking-tight truncate">
                {value}
              </h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
