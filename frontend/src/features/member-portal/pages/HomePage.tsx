import { MemberHomeProvider } from "../context/MemberHomeProvider";
import { useMemberHomeContext } from "../context/useMemberHomeContext";
import { HomeHeaderContainer } from "../components/HomeHeader/HomeHeaderContainer";
import { MembershipStatusCardContainer } from "../components/MembershipStatusCard/MembershipStatusCardContainer";
import { TodayWorkoutCardContainer } from "../components/TodayWorkoutCard/TodayWorkoutCardContainer";
import { EntryQrCardContainer } from "../components/EntryQrCard/EntryQrCardContainer";
import { AttendanceSummaryCardContainer } from "../components/AttendanceSummaryCard/AttendanceSummaryCardContainer";
import { AnnouncementSectionContainer } from "../components/AnnouncementSection/AnnouncementSectionContainer";
import { AlertCircle, RefreshCw } from "lucide-react";

function HomeContent() {
  const { error, refetch } = useMemberHomeContext();

  if (error) {
    return (
      <div className="p-6 sm:p-8 rounded-xl border border-border-default bg-background-paper text-center max-w-md mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-text-primary mb-1">
          Unable to load your dashboard.
        </h2>
        <p className="text-xs text-text-secondary mb-5">
          Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="min-w-[44px] min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-1">
      <HomeHeaderContainer />
      <MembershipStatusCardContainer />
      <TodayWorkoutCardContainer />
      <EntryQrCardContainer />
      <AttendanceSummaryCardContainer />
      <AnnouncementSectionContainer />
    </div>
  );
}

export function HomePage() {
  return (
    <MemberHomeProvider>
      <HomeContent />
    </MemberHomeProvider>
  );
}
