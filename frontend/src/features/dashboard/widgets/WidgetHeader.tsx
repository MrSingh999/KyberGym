import React from "react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function WidgetHeader({ title, description, action, className, ...props }: WidgetHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 pb-0 gap-3", className)} {...props}>
      <div className="flex flex-col">
        <h3 className="font-bold text-sm sm:text-base text-text-primary font-mono uppercase tracking-wide">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5 font-sans">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
