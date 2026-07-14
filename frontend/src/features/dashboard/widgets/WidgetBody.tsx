import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/feedback/Skeleton";

interface WidgetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  scrollable?: boolean;
}

export function WidgetBody({ 
  children, 
  isLoading, 
  isEmpty, 
  emptyState, 
  scrollable = false,
  className, 
  ...props 
}: WidgetBodyProps) {
  
  if (isLoading) {
    return (
      <div className="p-5 pt-4 flex-1">
        <Skeleton className="h-full min-h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (isEmpty && emptyState) {
    return (
      <div className="p-5 pt-4 flex-1 flex items-center justify-center">
        {emptyState}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "p-5 pt-4 flex-1", 
        scrollable && "overflow-y-auto max-h-[400px] custom-scrollbar",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
