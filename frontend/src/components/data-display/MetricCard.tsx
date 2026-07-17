import * as React from "react"
import { cn } from "../../lib/utils"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  description?: string;
  highlighted?: boolean;
}

export function MetricCard({ 
  label, 
  value, 
  description, 
  highlighted = false,
  className,
  ...props 
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center space-y-1 rounded-xl p-4 transition-colors",
        highlighted ? "bg-primary/5 border border-primary/20" : "bg-surface-hover border border-transparent",
        className
      )}
      {...props}
    >
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <div className="text-xl font-heading font-semibold text-text-primary">
        {value}
      </div>
      {description && (
        <span className="text-xs text-text-secondary mt-1">{description}</span>
      )}
    </div>
  )
}
