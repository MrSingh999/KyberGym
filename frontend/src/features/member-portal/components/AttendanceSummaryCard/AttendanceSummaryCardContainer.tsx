import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { AttendanceSummaryCardView } from "./AttendanceSummaryCardView";

export function AttendanceSummaryCardContainer() {
  const { homeData, isLoading } = useMemberHomeContext();
  const attendance = homeData?.attendance;

  const todayStatus = attendance?.todayPresent ? "present" : "absent";
  const currentStreak = attendance?.currentStreak ?? 0;
  const thisMonthCount = attendance?.thisMonth ?? 0;

  return (
    <AttendanceSummaryCardView
      todayStatus={todayStatus}
      currentStreak={currentStreak}
      thisMonthCount={thisMonthCount}
      isLoading={isLoading}
    />
  );
}
