import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className,
  ...props 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-default p-8 text-center animate-in fade-in zoom-in-95 duration-300",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-hover text-text-muted shadow-sm ring-1 ring-border-default">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
