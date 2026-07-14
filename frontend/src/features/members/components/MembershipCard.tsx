import React from "react";
import { format, parseISO } from "date-fns";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberProfile } from "../types/profile";
import { MetricCard } from "@/components/data-display/MetricCard";

interface MembershipCardProps {
  member?: MemberProfile;
  isLoading: boolean;
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const diff = parseISO(endDate).getTime() - Date.now();
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
                value={member.membershipStartDate ? format(parseISO(member.membershipStartDate), "MMM d, yyyy") : "—"}
              />
              <MetricCard
                label="End Date"
                value={member.membershipEndDate ? format(parseISO(member.membershipEndDate), "MMM d, yyyy") : "—"}
              />
              <MetricCard
                label="Days Remaining"
                value={daysRemaining !== null ? (daysRemaining > 0 ? `${daysRemaining}` : "Expired") : "—"}
                highlighted={daysRemaining !== null && daysRemaining <= 7}
              />
              <MetricCard
                label="Joined"
                value={format(parseISO(member.joiningDate), "MMM d, yyyy")}
              />
            </div>
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
