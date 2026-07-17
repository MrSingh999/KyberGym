import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface WidgetEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryHint?: string;
}

export function WidgetEmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryHint,
  className,
  ...props 
}: WidgetEmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-4 text-center h-full max-w-xs mx-auto my-auto animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-elevated text-text-muted shadow-xs ring-1 ring-border-default/50">
          {icon}
        </div>
      )}
      <h4 className="mb-0.5 text-xs font-bold text-text-primary font-sans leading-tight">{title}</h4>
      <p className="mb-3 text-[10px] text-text-secondary leading-normal">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="rounded-md font-semibold text-xs h-8 px-4 cursor-pointer">
          {actionLabel}
        </Button>
      )}
      {secondaryHint && (
        <p className="mt-2 text-[10px] text-text-muted font-mono leading-none">
          {secondaryHint}
        </p>
      )}
    </div>
  )
}
