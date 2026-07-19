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
import { Avatar, AvatarFallback } from "@/components/data-display/Avatar";
import { Badge } from "@/components/ui/badge";

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
    dueTimeframe === "today" ? [...(dues?.overdue || []), ...(dues?.dueToday || [])] :
    dueTimeframe === "3days" ? [...(dues?.overdue || []), ...(dues?.dueToday || []), ...(dues?.dueIn3Days || [])] :
    [...(dues?.overdue || []), ...(dues?.dueToday || []), ...(dues?.dueIn3Days || []), ...(dues?.dueIn7Days || [])];

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

      {/* Membership Dues — full width, top priority */}
      <WidgetContainer className="w-full min-h-[300px] sm:min-h-[400px]">
        <WidgetHeader
          title="Membership Dues"
          description="Memberships expiring or overdue"
          action={
            <div className="flex items-center gap-1.5 shrink-0">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-[10px] sm:text-[9px] px-1.5 py-0.2 font-bold font-sans">
                  {overdueCount} Overdue
                </Badge>
              )}
              {dueCount > 0 && (
                <Badge variant="warning" className="text-[10px] sm:text-[9px] px-1.5 py-0.2 font-bold font-sans">
                  {dueCount} Expiring
                </Badge>
              )}
            </div>
          }
        />
        <WidgetBody isLoading={isDuesLoading} isEmpty={false} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Filters row inside body */}
          <div className="flex flex-col gap-3 pb-3 border-b border-border-default shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] sm:text-[9px] text-text-muted font-bold uppercase tracking-wider font-mono shrink-0">
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
                        "px-2 h-6 sm:h-5 rounded-[4px] text-[10px] sm:text-[9px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center",
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
              
              <div className="flex bg-canvas border border-border-default p-0.5 rounded-[6px] self-start sm:self-center">
                {[
                  { key: "all" as const, label: `All (${totalDuesCount})`, activeClass: "bg-primary text-primary-foreground font-bold" },
                  { key: "overdue" as const, label: `Overdue (${overdueCount})`, activeClass: "bg-error/10 text-error border border-error/20 font-bold" },
                  { key: "due" as const, label: `Due (${dueCount})`, activeClass: "bg-warning/10 text-warning border border-warning/20 font-bold" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setDueFilter(f.key)}
                    className={cn(
                      "px-2.5 h-6 sm:h-5 rounded-[4px] text-[10px] sm:text-[9px] transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center border border-transparent",
                      dueFilter === f.key
                        ? f.activeClass
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable list container */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1 custom-scrollbar">
            {isDuesError ? (
              <ErrorState
                title="Failed to load dues"
                message={duesError?.message || "Could not load membership dues data."}
                onRetry={() => refetchDues()}
              />
            ) : filteredDues.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border border-border-default rounded-[8px] flex items-center justify-center mx-auto mb-3 text-text-secondary">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-text-primary mb-1 font-mono">
                  Diagnostics Clear
                </h3>
                <p className="text-text-secondary text-xs max-w-xs mx-auto mb-4">
                  No billing records match the selected configuration.
                </p>
                <Button
                  onClick={() => setIsAddMemberOpen(true)}
                  variant="outline"
                  className="text-[10px] h-8 flex items-center gap-1.5 mx-auto rounded-[6px] cursor-pointer"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Register Member</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredDues.map((member, idx) => {
                  const daysDiff = getDaysDiff(member.endDate);
                  const isOverdue = daysDiff < 0;
                  return (
                    <div
                      key={member.id || member._id || idx}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border transition-all duration-300 bg-surface/30 hover:bg-surface/50 hover:shadow-sm hover:border-border-hover hover:translate-y-[-1px] group",
                        isOverdue
                          ? "border-error/15 border-l-[3px] border-l-error"
                          : "border-warning/15 border-l-[3px] border-l-warning",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 sm:h-8 sm:w-8 shrink-0">
                          <AvatarFallback className={cn(
                            "text-xs sm:text-[10px] font-bold transition-all duration-300 group-hover:scale-105",
                            isOverdue 
                              ? "bg-error/10 text-error border border-error/20" 
                              : "bg-warning/10 text-warning border border-warning/20"
                          )}>
                            {member.memberId?.fullName?.substring(0, 2).toUpperCase() || "ME"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm sm:text-xs text-text-primary truncate group-hover:text-primary transition-colors duration-200">
                            {member.memberId?.fullName || "Gym Member"}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn(
                              "text-[10px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full",
                              isOverdue ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                            )}>
                              {isOverdue ? "Expired" : "Expiring"}
                            </span>
                            <span className="text-[10px] sm:text-[9px] text-text-muted font-mono">
                              {member.memberId?._id}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] sm:text-[9px] text-text-muted font-mono block">
                            Due: {formatDate(member.endDate)}
                          </span>
                          {isOverdue ? (
                            <span className="text-[10px] sm:text-[9px] text-error font-bold font-mono block mt-0.5">
                              {Math.abs(daysDiff)}d overdue
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-[9px] text-warning font-bold font-mono block mt-0.5">
                              {daysDiff}d left
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-border-default/50 pt-2 mt-2">
                        <div>
                          <p className="text-[10px] sm:text-[9px] text-text-muted uppercase font-bold font-mono leading-none">
                            Amount
                          </p>
                          <p className="text-sm sm:text-xs font-bold text-text-primary font-mono mt-0.5">
                            ₹{(member.amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="xs"
                          onClick={() => navigate(`/admin/payments/collect?memberId=${member.memberId?.id || member.memberId?._id || member.memberId}`)}
                          className="text-[10px] sm:text-[9px] font-bold h-7 sm:h-6 cursor-pointer rounded-[4px] px-2 active:scale-95 transition-transform"
                        >
                          Collect Payment
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </WidgetBody>
      </WidgetContainer>

      {/* Secondary Grid — Recent Members, Activity, Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Members — full row */}
        <div className="md:col-span-2">
          <RecentMembers className="min-h-[260px]" />
        </div>

        {/* Activity Feed */}
        <ActivityFeed className="min-h-[260px]" />

        {/* Revenue Trend Card */}
        <WidgetContainer className="min-h-[260px]">
          <WidgetHeader title="Revenue Trend" description="Past 7 days collection" />
          <WidgetBody isLoading={false} isEmpty={false} className="flex flex-col flex-1 justify-center min-h-0">
            {isRevenueLoading ? (
              <Skeleton className="h-[200px] w-full rounded-xl" />
            ) : isRevenueError ? (
              <ErrorState
                title="Failed to load revenue"
                message={revenueError?.message || "Could not load revenue data"}
                onRetry={() => refetchRevenue()}
              />
            ) : !revenueData || revenueData.length === 0 || revenueData.every(d => d.revenue === 0) ? (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <TrendingUp className="h-8 w-8 text-text-muted mb-3" />
                <p className="text-sm text-text-secondary text-center">No revenue data for the past 7 days.</p>
                <p className="text-xs text-text-muted mt-1 text-center">Revenue will appear once payments are recorded.</p>
              </div>
            ) : (
              <div className="h-[200px] w-full mt-2">
                <RevenueChart data={revenueData} />
              </div>
            )}
          </WidgetBody>
        </WidgetContainer>
      </div>

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
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }}
          onCancel={() => setIsAddMemberOpen(false)}
        />
      </ResponsiveModal>
    </div>
  );
}
