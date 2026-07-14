import { motion } from "framer-motion";
import { Dumbbell, Search } from "lucide-react";

type EmptyWorkoutsVariant = "no-workouts" | "no-search";

const CONFIG: Record<EmptyWorkoutsVariant, { icon: React.ElementType; title: string; description: string }> = {
  "no-workouts": {
    icon: Dumbbell,
    title: "No Programs Configured",
    description: "Create your first gym workout split program to start assigning it to members.",
  },
  "no-search": {
    icon: Search,
    title: "No workouts match your search",
    description: "Try a different title or clear filters.",
  },
};

interface EmptyWorkoutsStateProps {
  variant?: EmptyWorkoutsVariant;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyWorkoutsState({
  variant = "no-workouts",
  onAction,
  actionLabel,
}: EmptyWorkoutsStateProps) {
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
          {actionLabel ?? "Create Routine Program"}
        </button>
      )}
    </motion.div>
  );
}
