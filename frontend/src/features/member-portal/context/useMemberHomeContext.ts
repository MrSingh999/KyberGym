import { useContext } from "react";
import { MemberHomeContext, MemberHomeContextType } from "./MemberHomeProvider";

export function useMemberHomeContext(): MemberHomeContextType {
  const context = useContext(MemberHomeContext);
  if (!context) {
    throw new Error("useMemberHomeContext must be used within a MemberHomeProvider");
  }
  return context;
}
