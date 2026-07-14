import { Badge } from "@/components/ui/badge";

interface WorkoutStatusBadgeProps {
  isActive: boolean;
}

export function WorkoutStatusBadge({ isActive }: WorkoutStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
      Inactive
    </Badge>
  );
}
