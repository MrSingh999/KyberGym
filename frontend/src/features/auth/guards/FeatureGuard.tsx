import React from "react";
import { Navigate } from "react-router";
import { useHasFeature, FeatureFlag, useFeatures } from "../hooks/useFeatures";
import { Skeleton } from "../../../components/feedback/Skeleton";

interface FeatureGuardProps {
  children: React.ReactNode;
  feature: FeatureFlag;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ children, feature, fallback }: FeatureGuardProps) {
  const { isLoading } = useFeatures();
  const hasFeature = useHasFeature(feature);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  if (!hasFeature) {
    if (fallback) return <>{fallback}</>;
    // Redirect to upgrade page or feature disabled page
    return <Navigate to="/feature-disabled" replace />;
  }

  return <>{children}</>;
}
