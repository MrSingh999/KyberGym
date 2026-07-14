import { AttendanceStatus } from "../types";
import { cn } from "@/lib/utils";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const config: Record<
  AttendanceStatus,
  { label: string; classes: string }
> = {
  present: {
    label: "Present",
    classes:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  absent: {
    label: "Absent",
    classes:
      "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
  },
  late: {
    label: "Late",
    classes:
      "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
};

export function AttendanceStatusBadge({
  status,
  className,
}: AttendanceStatusBadgeProps) {
  const c = config[status];
  if (!c) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border w-fit",
        c.classes,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "present" && "bg-emerald-500",
          status === "absent" && "bg-red-500",
          status === "late" && "bg-amber-500"
        )}
      />
      {c.label}
    </span>
  );
}
