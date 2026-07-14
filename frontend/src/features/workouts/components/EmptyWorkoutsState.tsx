import { motion } from "framer-motion";
import { Dumbbell, Search } from "lucide-react";

type EmptyWorkoutsVariant = "no-workouts" | "no-search";

const CONFIG: Record<EmptyWorkoutsVariant, { icon: React.ElementType; title: string; description: string }> = {
  "no-workouts": {
    icon: Dumbbell,
    title: "No workouts yet",
    description: "Create your first workout plan to start assigning to members.",
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
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-default flex items-center justify-center mb-5 shadow-sm">
        <Icon className="w-7 h-7 text-muted" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-primary mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-xs mb-6">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          {actionLabel ?? "Create Workout"}
        </button>
      )}
    </motion.div>
  );
}
