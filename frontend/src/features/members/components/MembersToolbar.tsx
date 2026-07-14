import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemberDirectoryStore } from "../store/useMemberDirectoryStore";
import { SortingState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MembersToolbarProps {
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function MembersToolbar({ sorting, onSortingChange }: MembersToolbarProps) {
  const { searchQuery, setSearchQuery, filters, setFilters } = useMemberDirectoryStore();

  const currentStatus = filters.status[0] || "all";
  const currentDueStatus = filters.dueStatus || "all";
  const sortOption = sorting[0]?.id === "joiningDate" ? (sorting[0]?.desc ? "joining-desc" : "joining-asc") : "joining-desc";

  const handleStatusChange = (val: string) => {
    setFilters({ status: val === "all" ? [] : [val] });
  };

  const handleDueStatusChange = (val: string) => {
    setFilters({ dueStatus: val === "all" ? "" : val });
  };

  const handleSortChange = (val: string) => {
    onSortingChange([
      { id: "joiningDate", desc: val === "joining-desc" }
    ]);
  };

  const selectTriggerClass = "w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-3 h-auto min-h-[44px] text-sm text-text-primary cursor-pointer hover:border-border-hover transition-all duration-200 font-mono";

  return (
    <div className="glass-panel p-4 md:p-5 rounded-[16px] animate-fade-slide-up mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Search Member
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="search"
              placeholder="Name, phone, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-3 min-h-[44px] text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Status
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Due Schedule
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select value={currentDueStatus} onValueChange={handleDueStatusChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Timeline" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Timeline</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="3days">Due in 3 Days</SelectItem>
                <SelectItem value="7days">Due in 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort Select */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Sort Timeline
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-3 h-4 w-4 text-text-muted z-10 pointer-events-none" />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                <SelectItem value="joining-desc">Joining: Newest First</SelectItem>
                <SelectItem value="joining-asc">Joining: Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
