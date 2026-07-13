import React from "react";
import { MoreVertical, Phone, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { MemberDirectoryItem } from "../types";
import { MemberStatusBadge } from "./MemberStatusBadge";

interface DirectoryMemberCardProps {
  member: MemberDirectoryItem;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function DirectoryMemberCard({ member, isSelected, onSelect }: DirectoryMemberCardProps) {
  return (
    <Card className={`relative overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-hover'}`}>
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Custom Checkbox area for mobile bulk select */}
            {onSelect && (
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-default bg-surface'}`}
              >
                {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-surface" />}
              </button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.profilePhoto} />
              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-primary truncate text-sm">{member.name}</span>
              <span className="text-xs text-secondary truncate">{member.memberCode}</span>
            </div>
          </div>
          <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-hover transition-colors touch-target">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted font-medium">Plan</span>
            <span className="text-xs text-primary truncate font-medium">{member.planName || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted font-medium">Status</span>
            <div className="mt-0.5">
              <MemberStatusBadge status={member.membershipStatus} className="text-[10px] px-1.5 py-0" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-subtle mt-1">
          <a 
            href={`tel:${member.phone}`}
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center text-xs font-medium text-secondary hover:text-primary transition-colors touch-target"
          >
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Call
          </a>
          <button className="flex items-center text-xs font-medium text-primary touch-target group">
            View Details
            <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
