import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
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
        <SearchInput
          placeholder="Search workouts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted tabular-nums whitespace-nowrap">
          {totalCount} workout{totalCount !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center border border-default rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 transition-colors ${viewMode === "card" ? "bg-surface-hover text-primary" : "text-muted hover:text-primary"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 transition-colors ${viewMode === "table" ? "bg-surface-hover text-primary" : "text-muted hover:text-primary"}`}
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>

        <Button onClick={() => navigate("/admin/workouts/new")}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Workout
        </Button>
      </div>
    </div>
  );
}
