import React from "react";
import { format, parseISO } from "date-fns";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { WidgetEmptyState } from "../../dashboard/widgets/WidgetEmptyState";
import { PaymentSummaryItem } from "../types/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentsSummaryCardProps {
  payments?: PaymentSummaryItem[];
  isLoading: boolean;
}

const statusConfig = {
  paid: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  failed: { icon: XCircle, color: "text-error", bg: "bg-error/10" },
};

export function PaymentsSummaryCard({ payments, isLoading }: PaymentsSummaryCardProps) {
  return (
    <WidgetContainer>
      <WidgetHeader
        title="Recent Payments"
        action={<Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>}
      />
      <WidgetBody
        isLoading={isLoading}
        isEmpty={!payments?.length}
        emptyState={
          <WidgetEmptyState
            title="No Payments"
            description="Payment history will appear here."
            icon={<CreditCard className="h-6 w-6 text-text-muted" />}
          />
        }
      >
        <div className="space-y-3">
          {payments?.map((payment) => {
            const config = statusConfig[payment.status];
            const StatusIcon = config.icon;
            return (
              <div key={payment.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("h-8 w-8 shrink-0 rounded-lg flex items-center justify-center", config.bg, config.color)}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{payment.description}</p>
                    <p className="text-xs text-text-secondary">{format(parseISO(payment.date), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-text-primary shrink-0">₹{payment.amount}</span>
              </div>
            );
          })}
        </div>
      </WidgetBody>
    </WidgetContainer>
  );
}
