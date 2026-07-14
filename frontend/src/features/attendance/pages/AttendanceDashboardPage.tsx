import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useAttendanceStats } from "../hooks/useAttendance";
import { AttendanceDashboard } from "../components/AttendanceDashboard";
import { ErrorState } from "@/components/feedback/ErrorState";

export function AttendanceDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useAttendanceStats();

  if (isError) {
    return (
      <ErrorState
        title="Failed to load attendance stats"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
        className="min-h-[50vh]"
      />
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      <button
        onClick={() => navigate("/admin/attendance")}
        className="flex items-center text-sm text-muted hover:text-primary mb-4 min-h-[44px] touch-target cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Attendance
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Attendance <span className="text-text-secondary font-normal ml-0.5">Dashboard</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Overview of gym attendance across today, this week, and this month.
          </p>
        </div>
      </div>

      <AttendanceDashboard stats={stats} isLoading={isLoading} />
    </div>
  );
}
