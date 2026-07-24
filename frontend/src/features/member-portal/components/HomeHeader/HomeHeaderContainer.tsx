import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { HomeHeaderView } from "./HomeHeaderView";
import { getTimeBasedGreeting, formatDisplayDate } from "../../utils/formatters";

export function HomeHeaderContainer() {
  const { memberName } = useMemberHomeContext();
  const greeting = getTimeBasedGreeting();
  const formattedDate = formatDisplayDate();

  return (
    <HomeHeaderView
      greeting={greeting}
      memberName={memberName}
      formattedDate={formattedDate}
    />
  );
}
