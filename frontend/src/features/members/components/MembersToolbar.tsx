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
} from "../../../components/ui/select";

interface MembersToolbarProps {
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function MembersToolbar({ sorting, onSortingChange }: MembersToolbarProps) {
  const { searchQuery, setSearchQuery, filters, setFilters } = useMemberDirectoryStore();

  const currentStatus = filters.status[0] || "all";
  const currentPlan = filters.plan[0] || "all";
  const sortOption = sorting[0]?.id === "joiningDate" ? (sorting[0]?.desc ? "joining-desc" : "joining-asc") : "joining-desc";

  const handleStatusChange = (val: string) => {
    setFilters({ status: val === "all" ? [] : [val] });
  };

  const handlePlanChange = (val: string) => {
    setFilters({ plan: val === "all" ? [] : [val] });
  };

  const handleSortChange = (val: string) => {
    onSortingChange([
      { id: "joiningDate", desc: val === "joining-desc" }
    ]);
  };

  const selectTriggerClass = "w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-1.5 h-8 text-xs text-text-primary cursor-pointer hover:border-border-hover transition-all duration-200 font-mono";

  return (
    <div className="glass-panel p-4 md:p-5 rounded-[16px] animate-fade-slide-up mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Search Member
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-1.5 h-8 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Status
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-text-muted z-10 pointer-events-none" />
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-default rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="Expiring Soon">Due Soon</SelectItem>
                <SelectItem value="Expired">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Plan Filter */}
        <div className="space-y-1.5">
          <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Membership Plan
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-text-muted z-10 pointer-events-none" />
            <Select value={currentPlan} onValueChange={handlePlanChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-default rounded-[6px] shadow-2xl">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Pro Monthly">Pro Monthly</SelectItem>
                <SelectItem value="Elite Annual">Elite Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort Select */}
        <div className="space-y-1.5">
          <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider pl-0.5 font-mono">
            Sort Timeline
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-text-muted z-10 pointer-events-none" />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Sort Timeline" />
              </SelectTrigger>
              <SelectContent className="bg-surface border border-border-default rounded-[6px] shadow-2xl">
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
