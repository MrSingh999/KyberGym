import * as React from "react"
import { CheckCircle2, Clock, XCircle, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

export interface PaymentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  amount: number;
  currency?: string;
  date: string;
  status: "paid" | "pending" | "failed";
  description: string;
  member: string;
}

const statusConfig = {
  paid: { icon: CheckCircle2, color: "text-success", variant: "success" as const, bg: "bg-success/10" },
  pending: { icon: Clock, color: "text-warning", variant: "warning" as const, bg: "bg-warning/10" },
  failed: { icon: XCircle, color: "text-error", variant: "destructive" as const, bg: "bg-error/10" },
};

export function PaymentCard({ 
  id,
  amount, 
  currency = "₹", 
  date, 
  status, 
  description,
  member,
  className,
  ...props 
}: PaymentCardProps) {
  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className={cn("hover:shadow-sm transition-all group", className)} {...props}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", statusConfig[status].bg, statusConfig[status].color)}>
            <StatusIcon className="h-5 w-5" />
          </div>
          
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-primary truncate">
              {description}
            </span>
            <div className="flex items-center text-xs text-secondary mt-0.5 space-x-2">
              <span className="truncate">{member}</span>
              <span className="hidden sm:inline-block text-muted">•</span>
              <span className="hidden sm:inline-block truncate text-muted">{date}</span>
            </div>
          </div>
        </div>
        
        {/* Right: Amount & Status Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right flex flex-col sm:items-end">
            <span className="font-heading font-semibold text-primary text-base">
              {currency}{amount.toFixed(2)}
            </span>
            <Badge variant={statusConfig[status].variant} className="mt-1 sm:hidden">
              {status}
            </Badge>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <Badge variant={statusConfig[status].variant} className="capitalize">
              {status}
            </Badge>
            <button className="h-8 w-8 rounded-full hover:bg-surface-hover flex items-center justify-center text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
      </CardContent>
    </Card>
  )
}
