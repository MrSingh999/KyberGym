import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { MembershipStatusCardView } from "./MembershipStatusCardView";
import { formatShortDate } from "../../utils/formatters";

export function MembershipStatusCardContainer() {
  const { homeData, isLoading } = useMemberHomeContext();
  const membership = homeData?.membership;

  const hasActiveMembership = Boolean(membership && membership.status);
  const formattedExpiryDate = membership?.expiryDate ? formatShortDate(membership.expiryDate) : undefined;

  return (
    <MembershipStatusCardView
      planName={membership?.planName}
      status={membership?.status}
      formattedExpiryDate={formattedExpiryDate}
      daysRemaining={membership?.daysRemaining}
      hasActiveMembership={hasActiveMembership}
      isLoading={isLoading}
    />
  );
}
