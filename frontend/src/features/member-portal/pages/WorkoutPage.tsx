import { MemberWorkoutProvider } from "../workout/context/MemberWorkoutProvider";
import { WorkoutPageContainer } from "../workout/containers/WorkoutPageContainer";

export function WorkoutPage() {
  return (
    <MemberWorkoutProvider>
      <WorkoutPageContainer />
    </MemberWorkoutProvider>
  );
}
