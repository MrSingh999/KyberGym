import { EmptyState, EmptyStateProps } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils";

export function WidgetEmptyState({ className, ...props }: EmptyStateProps) {
  return (
    <EmptyState 
      className={cn("border-none p-4 shadow-none w-full", className)}
      {...props} 
    />
  );
}
