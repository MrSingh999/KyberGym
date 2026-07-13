import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface WidgetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function WidgetContainer({ children, className, ...props }: WidgetContainerProps) {
  return (
    <Card 
      className={cn("flex flex-col h-full bg-surface shadow-sm hover:shadow-md transition-shadow overflow-hidden", className)} 
      {...props}
    >
      {children}
    </Card>
  );
}

export { WidgetHeader } from "./WidgetHeader";
export { WidgetBody } from "./WidgetBody";
