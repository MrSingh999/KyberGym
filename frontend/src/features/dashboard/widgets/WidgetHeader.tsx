import React from "react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function WidgetHeader({ title, description, action, className, ...props }: WidgetHeaderProps) {
  return (
    <div className={cn("flex flex-row items-center justify-between px-5 pt-5 pb-0", className)} {...props}>
      <div className="flex flex-col">
        <h3 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}
