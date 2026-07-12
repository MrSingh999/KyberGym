import * as React from "react"
import { cn } from "../../lib/utils"
import { Stack } from "./Stack"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 border-b border-subtle", className)} {...props}>
      <Stack gap="xs" className="flex-1">
        <h2 className="text-xl font-heading font-semibold text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-secondary">{description}</p>
        )}
      </Stack>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
