import { createContext, ReactNode } from "react";
import { useMemberHome } from "../hooks/useMemberHome";
import { useAuthStore } from "../../../store/auth.store";
import type { MemberHomeData } from "../types/memberPortal.types";

export interface MemberHomeContextType {
  homeData: MemberHomeData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  memberName: string;
}

export const MemberHomeContext = createContext<MemberHomeContextType | undefined>(undefined);

interface MemberHomeProviderProps {
  children: ReactNode;
}

export function MemberHomeProvider({ children }: MemberHomeProviderProps) {
  const { data: homeData, isLoading, error, refetch } = useMemberHome();
  const { user } = useAuthStore();

  const memberName = user?.name || "Member";

  const value: MemberHomeContextType = {
    homeData,
    isLoading,
    error,
    refetch,
    memberName,
  };

  return (
    <MemberHomeContext.Provider value={value}>
      {children}
    </MemberHomeContext.Provider>
  );
}
