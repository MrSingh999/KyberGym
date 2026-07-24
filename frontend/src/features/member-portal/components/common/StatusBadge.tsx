export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();

  let colorStyle = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  let label = status;

  if (normalized === "active" || normalized === "present" || normalized === "enabled") {
    colorStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    label = normalized === "active" ? "Active" : normalized === "present" ? "Present" : "Enabled";
  } else if (normalized === "expired" || normalized === "absent" || normalized === "disabled") {
    colorStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";
    label = normalized === "expired" ? "Expired" : normalized === "absent" ? "Absent" : "Disabled";
  } else if (normalized === "pending" || normalized === "warning") {
    colorStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    label = "Pending";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle} ${className}`}
    >
      {label}
    </span>
  );
}
