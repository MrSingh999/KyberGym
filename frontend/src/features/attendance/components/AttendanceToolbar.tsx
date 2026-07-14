import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Calendar } from "lucide-react";
import { SortingState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { AttendanceStatus, AttendancePeriod } from "../types";

interface AttendanceToolbarProps {
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function AttendanceToolbar({
  sorting,
  onSortingChange,
}: AttendanceToolbarProps) {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    dateFilter,
    setDateFilter,
    clearFilters,
  } = useAttendanceStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const sortOption =
    sorting[0]?.id === "date"
      ? sorting[0]?.desc
        ? "date-desc"
        : "date-asc"
      : "date-desc";

  const hasFilters =
    searchQuery ||
    statusFilter !== "all" ||
    periodFilter !== "all" ||
    dateFilter;

  const selectTriggerClass =
    "w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-3 h-auto min-h-[44px] text-sm text-text-primary cursor-pointer hover:border-border-hover transition-all duration-200 font-mono";

  return (
    <div className="glass-panel p-4 md:p-5 rounded-[16px] animate-fade-slide-up mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Search Member
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="search"
              placeholder="Name, phone, or code..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-3 min-h-[44px] text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Status
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as AttendanceStatus | "all")
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Period
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select
              value={periodFilter}
              onValueChange={(v) =>
                setPeriodFilter(v as AttendancePeriod | "all")
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-3 min-h-[44px] text-sm text-text-primary focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Sort
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select
              value={sortOption}
              onValueChange={(val) => {
                onSortingChange([
                  { id: "date", desc: val === "date-desc" },
                ]);
              }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="date-desc">Date: Newest</SelectItem>
                <SelectItem value="date-asc">Date: Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end mt-3">
          <button
            onClick={clearFilters}
            className="text-[11px] font-mono font-bold text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-[6px] hover:bg-surface-hover min-h-[44px] cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
