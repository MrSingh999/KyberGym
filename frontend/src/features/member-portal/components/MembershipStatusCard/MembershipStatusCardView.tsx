import { StatusBadge } from "../common/StatusBadge";
import { CardSkeleton } from "../common/Skeletons";
import { CreditCard } from "lucide-react";

interface MembershipStatusCardViewProps {
  planName?: string;
  status?: string;
  formattedExpiryDate?: string;
  daysRemaining?: number;
  hasActiveMembership: boolean;
  isLoading: boolean;
}

export function MembershipStatusCardView({
  planName,
  status = "expired",
  formattedExpiryDate,
  daysRemaining = 0,
  hasActiveMembership,
  isLoading,
}: MembershipStatusCardViewProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!hasActiveMembership) {
    return (
      <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-text-muted" />
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Membership Status
          </h2>
        </div>
        <p className="text-sm font-semibold text-text-muted mt-2">
          No Active Membership
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Membership
        </h2>
        <StatusBadge status={status} />
      </div>

      <p className="text-lg sm:text-xl font-bold text-text-primary">
        {planName}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-text-secondary border-t border-border-default/60 pt-3">
        <div>
          <span className="block text-[11px] text-text-muted mb-0.5">Expires On</span>
          <span className="font-semibold text-text-primary">{formattedExpiryDate || "N/A"}</span>
        </div>
        <div>
          <span className="block text-[11px] text-text-muted mb-0.5">Time Remaining</span>
          <span className="font-semibold text-text-primary">{daysRemaining} days</span>
        </div>
      </div>
    </div>
  );
}
