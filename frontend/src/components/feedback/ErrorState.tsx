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
      <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-title font-heading font-bold text-primary mb-2">{title}</h3>
      <p className="text-secondary text-sm max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-default rounded-2xl bg-surface/50", className)}>
      <div className="w-16 h-16 bg-surface border border-subtle text-muted rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Ghost className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-title font-heading font-semibold text-primary mb-1">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
