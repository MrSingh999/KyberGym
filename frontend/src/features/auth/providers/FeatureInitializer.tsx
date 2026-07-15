import React from "react";
import { useFeatures } from "../hooks/useFeatures";
import { usePermissions } from "../hooks/usePermissions";

export function FeatureInitializer({ children }: { children: React.ReactNode }) {
  useFeatures();
  usePermissions();

  return <>{children}</>;
}
