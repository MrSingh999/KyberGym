import { AlertTriangle, Ghost } from "lucide-react";
import { cn } from "../../lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error mb-4">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Deprecated — use EmptyState from "./EmptyState" instead
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-default rounded-2xl bg-surface/50", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-default text-text-muted mb-4 shadow-sm">
        <Ghost className="size-8 opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
