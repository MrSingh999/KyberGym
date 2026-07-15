import { useMemo } from "react";
import { useGymStore } from "../../../store/gym.store";

export type FeatureFlag = "qr_module" | "broadcast_module" | "branding_module" | "custom_domain_module" | "staff_module" | "reports_module";

const ALL_FEATURES: FeatureFlag[] = [
  "qr_module",
  "broadcast_module",
  "branding_module",
  "custom_domain_module",
  "staff_module",
  "reports_module",
];

export function useFeatures() {
  const { gymFeatures } = useGymStore();

  const enabledFeatures = useMemo(() => {
    if (!gymFeatures?.enabledFeatures) return [] as FeatureFlag[];
    return ALL_FEATURES.filter(
      (f) => gymFeatures.enabledFeatures[f] === true
    );
  }, [gymFeatures]);

  return { data: enabledFeatures, isLoading: false, isError: false, error: null };
}

export function useHasFeature(feature: FeatureFlag) {
  const { data: features = [] } = useFeatures();
  return features.includes(feature);
}
