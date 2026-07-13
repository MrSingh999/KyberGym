import React from "react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function WidgetHeader({ title, description, action, className, ...props }: WidgetHeaderProps) {
  return (
    <div className={cn("flex flex-row items-center justify-between p-6 pb-2", className)} {...props}>
      <div className="flex flex-col space-y-1">
        <h3 className="font-heading font-semibold text-lg text-primary tracking-tight leading-none">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-secondary">{description}</p>
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
