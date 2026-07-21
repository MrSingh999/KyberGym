import { WorkoutStatus } from "../types";

interface WorkoutStatusBadgeProps {
  status: WorkoutStatus;
}

const statusStyles: Record<WorkoutStatus, { bg: string; text: string; dot: string; label: string }> = {
  DRAFT: {
    bg: "bg-zinc-500/10 border-zinc-500/20 dark:border-zinc-500/15",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-500",
    label: "Draft",
  },
  ACTIVE: {
    bg: "bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Active",
  },
  ARCHIVED: {
    bg: "bg-amber-500/10 border-amber-500/20 dark:border-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Archived",
  },
};

export function WorkoutStatusBadge({ status }: WorkoutStatusBadgeProps) {
  const s = statusStyles[status] || statusStyles.DRAFT;
  return (
    <span className={`inline-flex items-center space-x-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span>{s.label}</span>
    </span>
  );
}
