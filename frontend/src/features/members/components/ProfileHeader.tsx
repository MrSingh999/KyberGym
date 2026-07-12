import React from "react";
import { Phone, MoreVertical, CalendarCheck, RefreshCw, PauseCircle, PlayCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/data-display/Avatar";
import { Button } from "../../../../components/ui/Button";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberProfile } from "../types/profile";
import { cn } from "../../../../lib/utils";

interface ProfileHeaderProps {
  member: MemberProfile;
  onRenew: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ProfileHeader({ member, onRenew, onSuspend, onActivate }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const daysRemaining = getDaysRemaining(member.membershipEndDate);
  const isSuspended = member.membershipStatus === "Suspended";

  return (
    <div className="bg-surface border-b border-default sticky top-0 z-20">
      <div className="px-4 sm:px-6 pt-4 pb-0">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted hover:text-primary mb-4 touch-target"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Members
        </button>

        {/* Core profile row */}
        <div className="flex items-start gap-4 pb-5">
          <Avatar className="h-16 w-16 border-2 border-default ring-4 ring-surface shrink-0">
            <AvatarImage src={member.profilePhoto} />
            <AvatarFallback className="text-xl font-bold">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-heading font-bold text-primary truncate">{member.name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-xs font-mono text-secondary">{member.memberCode}</span>
                  <MemberStatusBadge status={member.membershipStatus} />
                </div>
              </div>
              <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted hover:bg-surface-hover transition-colors touch-target shrink-0">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Plan & Expiry */}
            {member.planName && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-sm font-medium text-primary bg-surface-hover px-2.5 py-1 rounded-lg border border-default">
                  {member.planName}
                </span>
                {daysRemaining !== null && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-lg",
                    daysRemaining <= 7 ? "bg-error/10 text-error" :
                    daysRemaining <= 30 ? "bg-warning/10 text-warning" :
                    "text-secondary"
                  )}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action strip */}
        <div className="flex items-center gap-2 pb-4 overflow-x-auto hide-scrollbar">
          <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target bg-surface-hover border border-default rounded-lg px-3 py-2 hover:border-hover transition-colors">
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <button onClick={onRenew} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:opacity-90 transition-opacity">
            <RefreshCw className="h-3.5 w-3.5" /> Renew
          </button>
          {isSuspended ? (
            <button onClick={onActivate} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target bg-success/10 text-success border border-success/20 rounded-lg px-3 py-2">
              <PlayCircle className="h-3.5 w-3.5" /> Activate
            </button>
          ) : (
            <button onClick={onSuspend} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target bg-error/10 text-error border border-error/20 rounded-lg px-3 py-2">
              <PauseCircle className="h-3.5 w-3.5" /> Suspend
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
