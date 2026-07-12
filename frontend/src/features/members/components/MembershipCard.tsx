import React from "react";
import { CalendarRange, Clock } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberProfile } from "../types/profile";
import { MetricCard } from "../../../../components/data-display/MetricCard";

interface MembershipCardProps {
  member?: MemberProfile;
  isLoading: boolean;
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function MembershipCard({ member, isLoading }: MembershipCardProps) {
  const daysRemaining = getDaysRemaining(member?.membershipEndDate);

  return (
    <WidgetContainer>
      <WidgetHeader title="Membership" />
      <WidgetBody isLoading={isLoading}>
        {member && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{member.planName || "No Plan"}</span>
              <MemberStatusBadge status={member.membershipStatus} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Start Date"
                value={member.membershipStartDate ? new Date(member.membershipStartDate).toLocaleDateString() : "—"}
              />
              <MetricCard
                label="End Date"
                value={member.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString() : "—"}
              />
              <MetricCard
                label="Days Remaining"
                value={daysRemaining !== null ? (daysRemaining > 0 ? `${daysRemaining}` : "Expired") : "—"}
                highlighted={daysRemaining !== null && daysRemaining <= 7}
              />
              <MetricCard
                label="Joined"
                value={new Date(member.joiningDate).toLocaleDateString()}
              />
            </div>
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
