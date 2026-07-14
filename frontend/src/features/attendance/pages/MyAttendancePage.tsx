import React, { useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ClipboardCheck } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMemberAttendance } from "../hooks/useAttendance";
import { AttendanceStatusBadge } from "../components/AttendanceStatusBadge";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

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

export function MyAttendancePage() {
  const { user } = useCurrentUser();
  const memberId = user?.memberId || "";

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, refetch } = useMemberAttendance(
    memberId,
    pagination
  );

  if (isError) {
    return (
      <ErrorState
        title="Failed to load attendance history"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
        className="min-h-[50vh]"
      />
    );
  }

  const records = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto animate-fade-slide-up">
      <div className="mb-6">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
          My <span className="text-text-secondary font-normal ml-0.5">Attendance</span>
        </h1>
        <p className="text-text-secondary mt-1 text-xs font-mono">
          Your gym check-in history.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-surface border border-border-default rounded-[12px] animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : records.length ? (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-4 bg-surface border border-border-default rounded-[12px] hover:border-border-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-primary font-mono">
                  {formatDate(record.date)}
                </span>
                <AttendanceStatusBadge status={record.status} />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-secondary font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-text-muted" />
                  In: {formatTime(record.checkInTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-text-muted" />
                  Out: {formatTime(record.checkOutTime)}
                </span>
              </div>
            </div>
          ))}

          {meta && meta.pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(0, p.pageIndex - 1),
                  }))
                }
                disabled={pagination.pageIndex === 0}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-text-muted font-mono">
                {pagination.pageIndex + 1} of {meta.pageCount}
              </span>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(meta.pageCount - 1, p.pageIndex + 1),
                  }))
                }
                disabled={pagination.pageIndex >= meta.pageCount - 1}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center border border-border-default rounded-[4px] text-text-secondary hover:text-text-primary hover:bg-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardCheck className="h-8 w-8" />}
          title="No attendance records"
          description="Your check-in history will appear here once you start visiting the gym."
        />
      )}
    </div>
  );
}
