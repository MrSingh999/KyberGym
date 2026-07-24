import { Dumbbell } from "lucide-react";

export function EmptyWorkoutView() {
  return (
    <div className="p-6 sm:p-8 rounded-xl border border-border-default bg-background-paper text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-border-default/50 text-text-muted flex items-center justify-center mx-auto mb-3">
        <Dumbbell className="w-6 h-6" />
      </div>
      <h2 className="text-base sm:text-lg font-bold text-text-primary mb-1">
        No workout assigned.
      </h2>
      <p className="text-xs text-text-secondary">
        You do not have any active workout programs assigned to your account yet. Contact your trainer or gym admin for assistance.
      </p>
    </div>
  );
}
