import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:opacity-90",
        secondary:
          "border-border-default bg-surface text-text-secondary hover:bg-surface-hover",
        destructive:
          "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 dark:border-red-500/15 font-bold font-mono text-[10px] tracking-wide py-0.5 px-2.5",
        outline: "text-text-secondary bg-surface border-border-default font-mono text-[10px] py-0.5 px-2.5",
        success: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/15 font-bold font-mono text-[10px] tracking-wide py-0.5 px-2.5",
        warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/15 font-bold font-mono text-[10px] tracking-wide py-0.5 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
