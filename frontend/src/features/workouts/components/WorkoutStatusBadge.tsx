interface WorkoutStatusBadgeProps {
  isActive: boolean;
}

export function WorkoutStatusBadge({ isActive }: WorkoutStatusBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex items-center space-x-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 dark:border-emerald-500/15 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono">
        <span className="status-dot status-dot-active" />
        <span>Active</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 dark:border-red-500/15 text-red-600 dark:text-red-400 bg-red-500/10 font-mono">
      <span className="status-dot status-dot-overdue" />
      <span>Inactive</span>
    </span>
  );
}
