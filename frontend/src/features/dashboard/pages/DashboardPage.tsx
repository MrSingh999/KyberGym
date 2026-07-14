import { format, differenceInDays, startOfDay, parseISO } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardDues } from "../hooks/useDashboardDues";
import { useDashboardRevenue } from "../hooks/useDashboardRevenue";
import { KpiGrid } from "../components/KpiGrid";
import { QuickActions } from "../components/QuickActions";
import { ActivityFeed } from "../components/ActivityFeed";
import { RecentMembers } from "../components/RecentMembers";
import { RevenueChart } from "../../../components/data-display/charts/RevenueChart";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { CreateMemberWizard } from "../../members/components/CreateMemberWizard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MemberStatusBadge } from "../../members/components/MemberStatusBadge";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [dueTimeframe, setDueTimeframe] = useState<"today" | "3days" | "7days">("7days");
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "due">("all");

  const {
    data: dues,
    isLoading: isDuesLoading,
    isError: isDuesError,
    error: duesError,
    refetch: refetchDues,
  } = useDashboardDues();
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    isError: isRevenueError,
    error: revenueError,
    refetch: refetchRevenue,
  } = useDashboardRevenue();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parsed = parseISO(dateStr);
    if (isNaN(parsed.getTime())) return "";
    return format(parsed, "MMM d, yyyy");
  };

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return 0;
    return differenceInDays(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
  };

  const activeDues =
    dueTimeframe === "today" ? dues?.dueToday || [] :
    dueTimeframe === "3days" ? dues?.dueIn3Days || [] :
    dues?.dueIn7Days || [];

  const overdueCount = activeDues.filter(m => getDaysDiff(m.endDate) < 0).length;
  const dueCount = activeDues.filter(m => getDaysDiff(m.endDate) >= 0).length;
  const totalDuesCount = activeDues.length;

  const filteredDues = activeDues.filter((member) => {
    const daysDiff = getDaysDiff(member.endDate);
    const isOverdue = daysDiff < 0;
    if (dueFilter === "overdue") return isOverdue;
    if (dueFilter === "due") return !isOverdue;
    return true;
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
            Console <span className="text-text-secondary font-normal ml-0.5">Overview</span>
          </h1>
          <p className="text-text-secondary mt-1 text-xs font-mono">
            Gym membership statuses & financial diagnostics dashboard.
          </p>
        </div>
        <Button
          onClick={() => setIsAddMemberOpen(true)}
          className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[6px] font-semibold text-xs transition-opacity duration-150 cursor-pointer border border-border-hover flex items-center gap-2 min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center sm:justify-start active:scale-[0.98]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register Member</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <KpiGrid />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dues Tracker */}
          <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-[16px] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-default pb-4">
              <div className="space-y-1.5 flex-1">
                <h2 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
                  Membership Dues Tracker
                </h2>
                <p className="text-xs text-text-secondary">
                  Active memberships expiring or overdue within the selected timeframe.
                </p>
                <div className="flex items-center space-x-2 pt-1.5 overflow-x-auto hide-scrollbar">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono shrink-0">
                    Timeframe:
                  </span>
                  <div className="flex bg-canvas border border-border-default p-0.5 rounded-[6px]">
                    {[
                      { val: "today" as const, label: "Today" },
                      { val: "3days" as const, label: "3 Days" },
                      { val: "7days" as const, label: "7 Days" },
                    ].map((tf) => (
                      <button
                        key={tf.val}
                        type="button"
                        onClick={() => setDueTimeframe(tf.val)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold transition-all duration-200 cursor-pointer",
                          dueTimeframe === tf.val
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-text-secondary hover:text-text-primary",
                        )}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex bg-canvas border border-border-default p-0.5 rounded-[6px] self-start lg:self-center shrink-0 max-w-full overflow-x-auto">
                {[
                  { key: "all" as const, label: `All (${totalDuesCount})`, activeClass: "bg-primary text-primary-foreground font-bold" },
                  { key: "overdue" as const, label: `Overdue (${overdueCount})`, activeClass: "bg-error/10 text-error border border-error/20 font-bold" },
                  { key: "due" as const, label: `Due (${dueCount})`, activeClass: "bg-warning/10 text-warning border border-warning/20 font-bold" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setDueFilter(f.key)}
                    className={cn(
                      "px-3 py-1 rounded-[4px] text-xs transition-all duration-150 cursor-pointer shrink-0",
                      dueFilter === f.key
                        ? f.activeClass
                        : "text-text-secondary hover:text-text-primary border border-transparent",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isDuesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : isDuesError ? (
              <ErrorState
                title="Failed to load dues"
                message={duesError?.message || "Could not load membership dues data."}
                onRetry={() => refetchDues()}
              />
            ) : filteredDues.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-12 h-12 border border-border-default rounded-[8px] flex items-center justify-center mx-auto mb-4 text-text-secondary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1 font-mono">
                  Diagnostics Clear
                </h3>
                <p className="text-text-secondary text-xs max-w-sm mx-auto mb-6">
                  No billing records match the selected filter configuration.
                </p>
                <Button
                  onClick={() => setIsAddMemberOpen(true)}
                  variant="outline"
                  className="text-xs flex items-center gap-2 mx-auto rounded-[6px] cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register Member</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredDues.map((member, idx) => {
                  const daysDiff = getDaysDiff(member.endDate);
                  const isOverdue = daysDiff < 0;
                  return (
                    <div
                      key={member._id || idx}
                    className={cn(
                      "p-4 rounded-[8px] border transition-all duration-200",
                      isOverdue
                        ? "bg-error/[0.01] border-error/20 hover:border-error/35 border-l-[3px] border-l-error"
                        : "bg-warning/[0.01] border-warning/20 hover:border-warning/35 border-l-[3px] border-l-warning",
                    )}
                    >
                      <div className="flex flex-col justify-between h-full gap-3">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-text-primary truncate">
                            {member.memberId?.fullName || "Gym Member"}
                          </h4>
                          <div className="flex items-center gap-2">
                            <MemberStatusBadge status={isOverdue ? "Expired" : "Expiring Soon"} />
                            <span className="text-[10px] text-text-muted font-mono">
                              {member.memberId?.memberCode}
                            </span>
                          </div>
                          <div className="text-xs text-text-secondary font-mono">
                            Due:{" "}
                            <strong className="text-text-primary">
                              {formatDate(member.endDate)}
                            </strong>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-border-default pt-3">
                          <div>
                            <p className="text-[9px] text-text-muted uppercase font-semibold font-mono">
                              Amount
                            </p>
                            <p className="text-sm font-bold text-text-primary font-mono">
                              ₹{(member.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {isOverdue ? (
                              <span className="text-[10px] text-error font-semibold font-mono block mb-1">
                                {Math.abs(daysDiff)}d overdue
                              </span>
                            ) : (
                              <span className="text-[10px] text-warning font-semibold font-mono block mb-1">
                                {daysDiff}d left
                              </span>
                            )}
                            <Button
                              size="xs"
                              onClick={() => navigate(`/admin/payments/collect?memberId=${member.memberId?._id}`)}
                              className="text-[10px] font-bold h-7 cursor-pointer rounded-[4px]"
                            >
                              Collect Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Members */}
          <RecentMembers />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <ActivityFeed />
        </div>
      </div>

      {/* Revenue Chart */}
      <WidgetContainer className="min-h-[350px]">
        <WidgetHeader title="Revenue Trend" description="Past 7 days collection" />
        <WidgetBody isLoading={false} isEmpty={false}>
          {isRevenueLoading ? (
            <Skeleton className="h-[220px] w-full rounded-xl" />
          ) : isRevenueError ? (
            <ErrorState
              title="Failed to load revenue"
              message={revenueError?.message || "Could not load revenue data"}
              onRetry={() => refetchRevenue()}
            />
          ) : !revenueData || revenueData.length === 0 || revenueData.every(d => d.revenue === 0) ? (
            <div className="flex flex-col items-center justify-center h-[220px]">
              <TrendingUp className="h-10 w-10 text-text-muted mb-3" />
              <p className="text-sm text-text-secondary">No revenue data for the past 7 days.</p>
              <p className="text-xs text-text-muted mt-1">Revenue will appear once payments are recorded.</p>
            </div>
          ) : (
            <RevenueChart data={revenueData} />
          )}
        </WidgetBody>
      </WidgetContainer>

      {/* Register Member Modal */}
      <ResponsiveModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        title="Register Gym Member"
      >
        <CreateMemberWizard
          onSuccess={() => {
            setIsAddMemberOpen(false);
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["members"] });
          }}
          onCancel={() => setIsAddMemberOpen(false)}
        />
      </ResponsiveModal>
    </div>
  );
}
