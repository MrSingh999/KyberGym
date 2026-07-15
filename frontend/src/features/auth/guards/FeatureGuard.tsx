import React from "react";
import { Navigate } from "react-router";
import { useHasFeature, FeatureFlag } from "../hooks/useFeatures";

interface FeatureGuardProps {
  children: React.ReactNode;
  feature: FeatureFlag;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ children, feature, fallback }: FeatureGuardProps) {
  const hasFeature = useHasFeature(feature);

  if (!hasFeature) {
    if (fallback) return <>{fallback}</>;
    // Redirect to upgrade page or feature disabled page
    return <Navigate to="/feature-disabled" replace />;
  }

  return <>{children}</>;
}
