import * as React from "react"
import { cn } from "../../lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number;
  total?: number;
}

export function AvatarGroup({ 
  className, 
  children, 
  limit = 4, 
  total,
  ...props 
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = childrenArray.slice(0, limit)
  const remainingCount = total 
    ? total - limit 
    : childrenArray.length - limit

  return (
    <div className={cn("flex items-center -space-x-3", className)} {...props}>
      {visibleChildren.map((child, i) => (
        <div key={i} className="relative ring-2 ring-surface rounded-full">
          {child}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-default bg-surface-hover text-xs font-medium text-primary ring-2 ring-surface">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
