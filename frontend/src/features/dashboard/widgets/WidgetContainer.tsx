import React from "react";
import { cn } from "@/lib/utils";

interface WidgetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WidgetContainer({ children, className, ...props }: WidgetContainerProps) {
  return (
    <div 
      className={cn("flex flex-col h-full glass-card rounded-[12px]", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export { WidgetHeader } from "./WidgetHeader";
export { WidgetBody } from "./WidgetBody";
