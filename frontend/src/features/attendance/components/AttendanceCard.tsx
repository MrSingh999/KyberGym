import React from "react";
import { Clock, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/Avatar";
import { AttendanceRecord } from "../types";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

interface AttendanceCardProps {
  record: AttendanceRecord;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "h:mm a");
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function AttendanceCard({ record }: AttendanceCardProps) {
  const navigate = useNavigate();
  const initials = record.memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 space-y-3 bg-surface border border-border-default rounded-[16px] transition-all duration-200 hover:border-border-hover hover:shadow-sm active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
          onClick={() =>
            navigate(`/admin/attendance/members/${record.memberId}`)
          }
        >
          <Avatar className="w-10 h-10 rounded-full border border-border-default shrink-0">
            <AvatarImage src={record.profilePhoto} />
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-black uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-text-primary leading-snug truncate hover:underline">
              {record.memberName}
            </h3>
            <div className="flex items-center text-xs text-text-muted mt-0.5 gap-1.5">
              <User className="h-3 w-3" />
              <span className="font-mono">{record.memberCode}</span>
            </div>
          </div>
        </div>
        <AttendanceStatusBadge status={record.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.01] border border-border-default/40 rounded-[8px] p-3">
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Date
          </p>
          <p className="font-semibold text-text-primary font-mono">
            {formatDate(record.date)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Check In
          </p>
          <p className="font-semibold text-text-primary font-mono flex items-center gap-1">
            <Clock className="h-3 w-3 text-text-muted" />
            {formatTime(record.checkInTime)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Check Out
          </p>
          <p className="font-semibold text-text-primary font-mono flex items-center gap-1">
            <Clock className="h-3 w-3 text-text-muted" />
            {formatTime(record.checkOutTime)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono">
            Plan
          </p>
          <p className="font-semibold text-text-primary font-mono capitalize truncate">
            {record.planName || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            navigate(`/admin/attendance/members/${record.memberId}`)
          }
          className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors duration-200 cursor-pointer min-h-[44px] flex-1 flex items-center justify-center active:scale-[0.97] border border-border-hover"
        >
          View History
        </button>
      </div>
    </div>
  );
}
