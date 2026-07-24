import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { EntryQrCardView } from "./EntryQrCardView";

export function EntryQrCardContainer() {
  const { homeData, isLoading } = useMemberHomeContext();

  const isFeatureEnabled = homeData?.features?.qrEntry !== false;
  if (!isFeatureEnabled) return null;

  const isQrEnabled = Boolean(homeData?.entryQr?.enabled);

  return (
    <EntryQrCardView
      enabled={isQrEnabled}
      isLoading={isLoading}
    />
  );
}
