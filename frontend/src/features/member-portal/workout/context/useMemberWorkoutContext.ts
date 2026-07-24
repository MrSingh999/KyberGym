import { useContext } from "react";
import { MemberWorkoutContext, MemberWorkoutContextType } from "./MemberWorkoutProvider";

export function useMemberWorkoutContext(): MemberWorkoutContextType {
  const context = useContext(MemberWorkoutContext);
  if (!context) {
    throw new Error("useMemberWorkoutContext must be used within a MemberWorkoutProvider");
  }
  return context;
}
