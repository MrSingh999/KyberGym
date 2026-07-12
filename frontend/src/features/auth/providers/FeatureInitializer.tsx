import React from "react";
import { useGymStore } from "../../../store/gym.store";
import { useFeatures } from "../hooks/useFeatures";
import { usePermissions } from "../hooks/usePermissions";

export function FeatureInitializer({ children }: { children: React.ReactNode }) {
  const { selectedGymId } = useGymStore();

  // Prefetch critical authorization requirements for the selected tenant
  useFeatures();
  usePermissions();

  return <>{children}</>;
}
