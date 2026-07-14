import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useWorkoutStore } from "../store/useWorkoutStore";

interface WorkoutToolbarProps {
  totalCount: number;
}

export function WorkoutToolbar({ totalCount }: WorkoutToolbarProps) {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useWorkoutStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex-1 w-full sm:max-w-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-default rounded-[6px] pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-hover transition-all duration-200 font-mono"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted tabular-nums whitespace-nowrap font-mono">
          {totalCount} workout{totalCount !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center border border-border-default rounded-[6px] overflow-hidden">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 transition-colors ${viewMode === "card" ? "bg-surface-hover text-text-primary" : "text-text-muted hover:text-text-primary"} cursor-pointer`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 transition-colors ${viewMode === "table" ? "bg-surface-hover text-text-primary" : "text-text-muted hover:text-text-primary"} cursor-pointer`}
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>

        <Button
          onClick={() => navigate("/admin/workouts/new")}
          className="flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] border border-border-hover min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center sm:justify-start active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Workout</span>
        </Button>
      </div>
    </div>
  );
}
