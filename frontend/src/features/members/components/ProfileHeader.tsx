import React from "react";
import { differenceInDays } from "date-fns";
import { Phone, MoreVertical, RefreshCw, PauseCircle, PlayCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { MemberProfile } from "../types/profile";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileHeaderProps {
  member: MemberProfile;
  onRenew: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  onFreeze: () => void;
  onResume: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  return differenceInDays(new Date(endDate), new Date());
}

export function ProfileHeader({ member, onRenew, onSuspend, onActivate, onFreeze, onResume, onEdit, onDelete }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const daysRemaining = getDaysRemaining(member.membershipEndDate);
  const isSuspended = member.membershipStatus === "Suspended";

  return (
    <div className="bg-surface border-b border-default sticky top-0 z-20">
      <div className="px-4 sm:px-6 pt-4 pb-0">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted hover:text-primary mb-4 min-h-[44px] touch-target cursor-pointer"
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
                  {member.subscriptionStatus && (
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-[4px] font-semibold border",
                      member.subscriptionStatus === 'active' ? "bg-success/10 border-success/20 text-success" :
                      member.subscriptionStatus === 'paused' ? "bg-warning/10 border-warning/20 text-warning" :
                      "bg-muted border-default text-muted-foreground"
                    )}>
                      Sub: {member.subscriptionStatus}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-11 w-11 rounded-full flex items-center justify-center text-muted hover:bg-surface-hover transition-colors touch-target shrink-0 cursor-pointer focus:outline-none">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-surface border border-default shadow-xl rounded-lg py-1 z-50">
                  <DropdownMenuItem onClick={onEdit} className="px-4 py-2 text-sm text-primary hover:bg-surface-hover cursor-pointer transition-colors focus:bg-surface-hover focus:outline-none">
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="px-4 py-2 text-sm text-destructive hover:bg-red-500/10 cursor-pointer transition-colors focus:bg-red-500/10 focus:outline-none">
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-surface-hover border border-default rounded-lg px-4 py-3 hover:border-hover transition-colors">
            <Phone className="h-4 w-4" /> Call
          </a>
          <button onClick={onRenew} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-primary text-primary-foreground rounded-lg px-4 py-3 hover:opacity-90 transition-opacity cursor-pointer">
            <RefreshCw className="h-4 w-4" /> Renew
          </button>
          
          {/* Freeze / Resume Actions on Subscription */}
          {member.activeSubId && (
            member.subscriptionStatus === 'paused' ? (
              <button onClick={onResume} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-success/15 text-success border border-success/30 rounded-lg px-4 py-3 hover:bg-success/20 transition-colors cursor-pointer">
                Resume
              </button>
            ) : member.subscriptionStatus === 'active' ? (
              <button onClick={onFreeze} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-warning/15 text-warning border border-warning/30 rounded-lg px-4 py-3 hover:bg-warning/20 transition-colors cursor-pointer">
                Freeze
              </button>
            ) : null
          )}

          {isSuspended ? (
            <button onClick={onActivate} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-success/10 text-success border border-success/20 rounded-lg px-4 py-3 hover:bg-success/15 transition-colors cursor-pointer">
              <PlayCircle className="h-4 w-4" /> Activate
            </button>
          ) : (
            <button onClick={onSuspend} className="flex items-center gap-1.5 text-xs font-semibold shrink-0 touch-target min-h-[44px] bg-error/10 text-error border border-error/20 rounded-lg px-4 py-3 hover:bg-error/15 transition-colors cursor-pointer">
              <PauseCircle className="h-4 w-4" /> Suspend
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
