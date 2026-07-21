import React from "react";
import { cn } from "@/lib/utils";

interface WidgetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WidgetContainer({ children, className, ...props }: WidgetContainerProps) {
  return (
    <div 
      className={cn("flex flex-col h-full bg-surface/80 backdrop-blur-xs border border-border-default/80 hover:border-border-hover/80 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export { WidgetHeader } from "./WidgetHeader";
export { WidgetBody } from "./WidgetBody";
