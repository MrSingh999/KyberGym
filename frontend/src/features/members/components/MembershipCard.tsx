import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Hourglass, LogIn } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberProfile } from "../types/profile";
import { cn } from "@/lib/utils";

interface MembershipCardProps {
  member?: MemberProfile;
  isLoading: boolean;
}

interface StatRowProps { icon: React.ReactNode; label: string; value: string; highlighted?: boolean }

function StatRow({ icon, label, value, highlighted }: StatRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 sm:gap-3 py-2.5 sm:py-3 border-b border-border-default last:border-b-0",
      highlighted && "bg-warning/5 -mx-4 sm:-mx-5 px-4 sm:px-5"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        highlighted ? "bg-warning/10 text-warning" : "bg-surface-hover text-text-muted"
      )}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">{label}</span>
        <span className={cn(
          "text-sm font-medium truncate",
          highlighted ? "text-warning" : "text-text-primary"
        )}>{value}</span>
      </div>
    </div>
  );
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const diff = parseISO(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function MembershipCard({ member, isLoading }: MembershipCardProps) {
  const daysRemaining = getDaysRemaining(member?.membershipEndDate);
  const isExpiring = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <WidgetContainer>
      <WidgetHeader title="Membership Tier" description="Active subscription & validity details" />
      <WidgetBody isLoading={isLoading}>
        {member && (
          <div className="divide-y divide-border-default/60 font-mono">
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Plan Tier</span>
                <span className="text-sm sm:text-base font-extrabold text-text-primary mt-0.5">{member.planName || "No Active Plan"}</span>
              </div>
              <MemberStatusBadge status={member.membershipStatus} />
            </div>
            <StatRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Start Date"
              value={member.membershipStartDate ? format(parseISO(member.membershipStartDate), "MMM d, yyyy") : "—"}
            />
            <StatRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="End Date"
              value={member.membershipEndDate ? format(parseISO(member.membershipEndDate), "MMM d, yyyy") : "—"}
            />
            <StatRow
              icon={<Hourglass className="h-4 w-4" />}
              label="Days Remaining"
              value={daysRemaining !== null ? (daysRemaining > 0 ? `${daysRemaining} days` : "Expired") : "—"}
              highlighted={isExpiring || isExpired}
            />
            <StatRow
              icon={<LogIn className="h-4 w-4 text-text-muted" />}
              label="Joined Gym"
              value={member.joiningDate ? format(parseISO(member.joiningDate), "MMM d, yyyy") : "—"}
            />
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
