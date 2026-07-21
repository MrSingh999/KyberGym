import { motion } from "framer-motion";
import { Share2, Search } from "lucide-react";

type EmptyAssignmentsVariant = "no-assignments" | "no-search";

const CONFIG: Record<EmptyAssignmentsVariant, { icon: React.ElementType; title: string; description: string }> = {
  "no-assignments": {
    icon: Share2,
    title: "No Assignments Yet",
    description: "Assign a workout to one or more members to get started.",
  },
  "no-search": {
    icon: Search,
    title: "No assignments match your search",
    description: "Try a different filter or clear your search.",
  },
};

interface EmptyAssignmentsStateProps {
  variant?: EmptyAssignmentsVariant;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyAssignmentsState({
  variant = "no-assignments",
  onAction,
  actionLabel,
}: EmptyAssignmentsStateProps) {
  const { icon: Icon, title, description } = CONFIG[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-panel p-12 text-center rounded-[16px] border border-border-hover space-y-4 max-w-lg mx-auto"
    >
      <div className="w-16 h-16 bg-surface/45 border border-border-default text-zinc-500 rounded-full flex items-center justify-center mx-auto">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-bold text-base text-text-primary font-mono">{title}</h3>
        <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">{description}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-[6px] text-xs font-bold transition-all hover:opacity-90 cursor-pointer"
        >
          {actionLabel ?? "Assign Workout"}
        </button>
      )}
    </motion.div>
  );
}
