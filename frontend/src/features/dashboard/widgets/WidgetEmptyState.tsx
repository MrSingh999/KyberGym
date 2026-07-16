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
        "flex flex-col items-center justify-center p-6 text-center h-full max-w-xs mx-auto my-auto animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-elevated text-text-muted shadow-xs ring-1 ring-border-default/50">
          {icon}
        </div>
      )}
      <h4 className="mb-1 text-sm font-bold text-text-primary font-sans leading-none">{title}</h4>
      <p className="mb-4 text-xs text-text-secondary leading-normal">
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
