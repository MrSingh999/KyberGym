import React, { useState } from "react";
import { PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table";
import { ClipboardCheck, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { AttendanceToolbar } from "../components/AttendanceToolbar";
import { AttendanceTable } from "../components/AttendanceTable";
import { AttendanceCard } from "../components/AttendanceCard";
import { useAttendanceList } from "../hooks/useAttendance";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { MarkAttendanceForm } from "../components/MarkAttendanceForm";

export function AttendancePage() {
  const navigate = useNavigate();
  const [isMarkOpen, setIsMarkOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading, isError, refetch } = useAttendanceList(
    pagination,
    sorting
  );

  if (isError) {
    return (
      <ErrorState
        title="Failed to load attendance records"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Attendance <span className="text-text-secondary font-normal ml-0.5">Records</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Track and manage member attendance.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate("/admin/attendance/dashboard")}
            variant="outline"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 sm:py-2 rounded-[6px] min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center active:scale-[0.98] cursor-pointer"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="sm:hidden lg:inline">Dashboard</span>
          </Button>
          <Button
            onClick={() => setIsMarkOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] border border-border-hover min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center active:scale-[0.98] cursor-pointer"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>Mark Attendance</span>
          </Button>
        </div>
      </div>

      <AttendanceToolbar sorting={sorting} onSortingChange={setSorting} />

      <div className="w-full">
        <div className="hidden lg:block">
          <AttendanceTable
            data={data?.data || []}
            pageCount={data?.meta.pageCount || -1}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            isLoading={isLoading}
          />
        </div>

        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-slide-up">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 space-y-3 bg-surface border border-border-default rounded-[16px] animate-pulse"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                  </div>
                  <Skeleton className="h-[4.5rem] w-full rounded-[8px]" />
                  <Skeleton className="h-11 w-full rounded-[6px]" />
                </div>
              ))
            ) : data?.data.length ? (
              data.data.map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<ClipboardCheck className="h-8 w-8" />}
                  title="No attendance records"
                  description="No records match your criteria. Try adjusting filters or mark a new attendance."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ResponsiveModal
        open={isMarkOpen}
        onOpenChange={setIsMarkOpen}
        title="Mark Attendance"
        description="Record a member's attendance for today."
      >
        <MarkAttendanceForm onSuccess={() => setIsMarkOpen(false)} />
      </ResponsiveModal>
    </div>
  );
}
