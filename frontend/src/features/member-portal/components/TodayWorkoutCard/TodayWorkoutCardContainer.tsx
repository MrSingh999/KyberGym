import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { TodayWorkoutCardView } from "./TodayWorkoutCardView";

export function TodayWorkoutCardContainer() {
  const { homeData, isLoading } = useMemberHomeContext();
  const workout = homeData?.todayWorkout;
  const hasWorkout = Boolean(workout && workout.title);

  return (
    <TodayWorkoutCardView
      title={workout?.title}
      dayName={workout?.dayName}
      exerciseCount={workout?.exerciseCount}
      hasWorkout={hasWorkout}
      isLoading={isLoading}
    />
  );
}
