import { LayoutGrid, Table as TableIcon, Search, Dumbbell, Flame, Heart, Sparkles, Layers } from "lucide-react";
import { useNavigate } from "react-router";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { WorkoutStatus } from "../types";

interface WorkoutToolbarProps {
  totalCount: number;
}

const CATEGORIES = [
  { id: "all", label: "All Categories", icon: Layers },
  { id: "Strength", label: "Strength", icon: Dumbbell },
  { id: "Cardio", label: "Cardio / HIIT", icon: Flame },
  { id: "Hypertrophy", label: "Hypertrophy", icon: Sparkles },
  { id: "Endurance", label: "Endurance", icon: Heart },
];

export function WorkoutToolbar({ totalCount }: WorkoutToolbarProps) {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, viewMode, setViewMode, filters, setFilters } = useWorkoutStore();

  const currentCategory = filters.category || "all";

  const handleCategorySelect = (catId: string) => {
    setFilters({ category: catId === "all" ? undefined : catId });
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = (cat.id === "all" && !filters.category) || filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold font-mono border transition-all duration-200 cursor-pointer shrink-0 min-h-[38px] ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border-default hover:border-border-hover hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, category or goal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => setFilters({ status: v === "all" ? undefined : v as WorkoutStatus })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-text-muted tabular-nums whitespace-nowrap font-mono hidden md:inline">
            {totalCount} program{totalCount !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center border border-border-default rounded-[6px] overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 transition-colors ${viewMode === "card" ? "bg-surface-hover text-text-primary font-bold" : "text-text-muted hover:text-text-primary"} cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${viewMode === "table" ? "bg-surface-hover text-text-primary font-bold" : "text-text-muted hover:text-text-primary"} cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
