import React from "react";
import { Phone, History, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { MemberDirectoryItem } from "../types";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { DueBadge } from "./DueBadge";
import { useNavigate } from "react-router";

interface DirectoryMemberCardProps {
  member: MemberDirectoryItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeleteMember?: (id: string, name: string) => void;
}

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export function DirectoryMemberCard({ member, isSelected, onSelect, onDeleteMember }: DirectoryMemberCardProps) {
  const navigate = useNavigate();
  const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`p-4 space-y-3 bg-surface border border-border-default rounded-[16px] transition-all duration-200 hover:border-border-hover hover:shadow-sm active:scale-[0.99] ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Header row: avatar + name/gender/dob, status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          {onSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-border-default bg-surface'}`}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-surface" />}
            </button>
          )}
          <Avatar className="w-9 h-9 rounded-full border border-border-default shrink-0 cursor-pointer" onClick={() => navigate(`/admin/members/${member.id}`)}>
            <AvatarImage src={member.profilePhoto} />
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-black uppercase shrink-0">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 cursor-pointer" onClick={() => navigate(`/admin/members/${member.id}`)}>
            <h3 className="font-bold text-sm text-text-primary leading-snug truncate hover:underline">{member.name}</h3>
            <div className="flex items-center text-xs text-text-muted mt-1 space-x-2">
              <span className="capitalize">{member.gender || "—"}</span>
              <span>&bull;</span>
              <span className="font-mono">{member.memberCode}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <MemberStatusBadge status={member.membershipStatus} />
          {member.dueStatus && <DueBadge status={member.dueStatus} />}
        </div>
      </div>

      {/* Details block */}
      <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.01] border border-border-default/40 rounded-[8px] p-3">
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Plan Type</p>
          <p className="font-semibold text-text-primary capitalize font-mono">{member.planName || "N/A"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Member Code</p>
          <p className="font-bold text-text-primary font-mono">{member.memberCode}</p>
        </div>
        <div className="space-y-1 col-span-2 pt-2 border-t border-border-default/20">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">Timeline</p>
          <p className="text-text-secondary font-medium tabular-nums font-mono flex items-center space-x-1 text-xs">
            <span>{formatDate(member.joiningDate)} → {formatDate(member.membershipEndDate)}</span>
          </p>
        </div>
      </div>

      {/* Actions & Contact */}
      <div className="flex items-center justify-between pt-1">
        <a
          href={`tel:${member.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-1.5 text-xs text-text-primary hover:opacity-80 font-bold transition-all duration-200 min-h-[44px] px-1 rounded-[6px] font-mono"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="tabular-nums">{member.phone}</span>
        </a>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(`/admin/members/${member.id}`)}
            className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors duration-200 cursor-pointer min-h-[44px] flex-1 flex items-center justify-center active:scale-[0.97] border border-border-hover"
          >
            Details
          </button>
          <button
            onClick={() => navigate(`/admin/members/${member.id}`)}
            aria-label="Payment History"
            className="p-2.5 border border-border-default rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors duration-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteMember && onDeleteMember(member.id, member.name)}
            aria-label="Delete Member"
            className="p-2.5 border border-border-default rounded-[6px] text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors duration-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
