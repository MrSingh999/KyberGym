import { format, differenceInDays, startOfDay, parseISO } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserPlus, TrendingUp, Users, UserCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useMyProfile, useMyMembers } from "../../trainers/hooks/useTrainers";
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
  const { user } = useAuthStore();
  const isTrainer = user?.role === "trainer";

  if (isTrainer) {
    return <TrainerDashboardView />;
  }
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [dueTimeframe, setDueTimeframe] = useState<"today" | "3days" | "7days">("7days");
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "due">("all");
  const [duesSearch, setDuesSearch] = useState("");

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

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
    if (dueFilter === "overdue" && !isOverdue) return false;
    if (dueFilter === "due" && isOverdue) return false;

    if (duesSearch) {
      const q = duesSearch.toLowerCase();
      const name = (member.memberId?.fullName || "").toLowerCase();
      const code = (member.memberId?.memberCode || member.memberId?._id || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-default/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
              {getGreeting()}, <span className="text-primary font-bold">Coach</span> 👋
            </h1>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
              {format(new Date(), "EEEE, MMM d")}
            </span>
          </div>
          <p className="text-text-secondary text-xs font-mono">
            Gym SaaS operations console & real-time membership analytics.
          </p>
        </div>

        <Button
          onClick={() => setIsAddMemberOpen(true)}
          className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-[8px] font-semibold text-xs transition-all duration-150 cursor-pointer border border-border-hover flex items-center gap-2 min-h-[44px] sm:min-h-[40px] w-full sm:w-auto justify-center sm:justify-start active:scale-[0.98] shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Member</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <KpiGrid />

      {/* Quick Actions */}
      <QuickActions />

      {/* Membership Dues — full width, top priority */}
      <WidgetContainer className="w-full min-h-[340px] sm:min-h-[400px]">
        <WidgetHeader
          title="Membership Dues & Billing Diagnostics"
          description="Track active expirations and pending payment collections"
          action={
            <div className="flex items-center gap-2 shrink-0">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-xs sm:text-[10px] px-2.5 py-1 font-bold font-mono">
                  {overdueCount} Overdue
                </Badge>
              )}
              {dueCount > 0 && (
                <Badge variant="warning" className="text-xs sm:text-[10px] px-2.5 py-1 font-bold font-mono">
                  {dueCount} Expiring
                </Badge>
              )}
            </div>
          }
        />
        <WidgetBody isLoading={isDuesLoading} isEmpty={false} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Filters & Search row inside body */}
          <div className="flex flex-col gap-3 pb-4 border-b border-border-default/60 shrink-0">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Live Search Box */}
              <div className="relative flex-1 w-full md:max-w-xs">
                <input
                  type="text"
                  placeholder="Search member by name or code..."
                  value={duesSearch}
                  onChange={(e) => setDuesSearch(e.target.value)}
                  className="w-full bg-surface/90 border border-border-default rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 font-mono min-h-[44px] md:min-h-[38px] transition-all"
                />
              </div>

              {/* Timeframe & Status Filter Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-surface/60 border border-border-default/70 p-1 rounded-xl">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono pl-2 shrink-0">
                    Range:
                  </span>
                  <div className="flex items-center gap-1 flex-1 sm:flex-initial">
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
                          "flex-1 sm:flex-initial px-3 h-10 sm:h-7 rounded-lg text-xs sm:text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center font-mono touch-target",
                          dueTimeframe === tf.val
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
                        )}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-surface/60 border border-border-default/70 p-1 rounded-xl overflow-x-auto custom-scrollbar">
                  {[
                    { key: "all" as const, label: `All (${totalDuesCount})`, activeClass: "bg-primary text-primary-foreground font-bold shadow-xs" },
                    { key: "overdue" as const, label: `Overdue (${overdueCount})`, activeClass: "bg-error/15 text-error border border-error/30 font-bold" },
                    { key: "due" as const, label: `Due (${dueCount})`, activeClass: "bg-warning/15 text-warning border border-warning/30 font-bold" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setDueFilter(f.key)}
                      className={cn(
                        "flex-1 sm:flex-initial px-3 h-10 sm:h-7 rounded-lg text-xs sm:text-[10px] transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center border border-transparent font-mono touch-target",
                        dueFilter === f.key
                          ? f.activeClass
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
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
                <div className="w-12 h-12 border border-border-default rounded-2xl flex items-center justify-center mx-auto mb-3 text-text-secondary bg-surface/50">
                  <TrendingUp className="h-5 w-5" />
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
                  className="text-xs h-10 px-4 flex items-center gap-2 mx-auto rounded-xl cursor-pointer min-h-[44px]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Member</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredDues.map((member, idx) => {
                  const daysDiff = getDaysDiff(member.endDate);
                  const isOverdue = daysDiff < 0;
                  return (
                    <div
                      key={member.id || member._id || idx}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-300 bg-surface/40 hover:bg-surface/80 hover:shadow-md hover:-translate-y-0.5 group flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                        isOverdue
                          ? "border-error/20 border-l-4 border-l-error"
                          : "border-warning/20 border-l-4 border-l-warning",
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Avatar className="h-11 w-11 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className={cn(
                            "text-xs font-bold transition-transform duration-300 group-hover:scale-105",
                            isOverdue 
                              ? "bg-error/10 text-error border border-error/20" 
                              : "bg-warning/10 text-warning border border-warning/20"
                          )}>
                            {member.memberId?.fullName?.substring(0, 2).toUpperCase() || "ME"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-text-primary truncate group-hover:text-primary transition-colors">
                              {member.memberId?.fullName || "Gym Member"}
                            </h4>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                              isOverdue ? "bg-error/15 text-error" : "bg-warning/15 text-warning"
                            )}>
                              {isOverdue ? "Expired" : "Expiring"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-muted font-mono truncate">
                              ID: {member.memberId?._id || member.memberId?.memberCode || "—"}
                            </span>
                            <span className="text-border-default">•</span>
                            <span className="text-xs text-text-muted font-mono">
                              Due: {formatDate(member.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount & Collect Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border-default/50 pt-2.5 sm:pt-0 mt-1 sm:mt-0 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-text-muted uppercase font-bold font-mono leading-none">
                            Amount Due
                          </p>
                          <p className="text-base sm:text-sm font-extrabold text-text-primary font-mono mt-0.5">
                            ₹{(member.amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/member-payments/collect?memberId=${member.memberId?.id || member.memberId?._id || member.memberId}`)}
                          className="text-xs font-bold h-11 sm:h-9 cursor-pointer rounded-xl px-4 min-h-[44px] sm:min-h-[36px] active:scale-95 transition-transform flex items-center justify-center gap-1.5 bg-primary text-primary-foreground shadow-xs"
                        >
                          <span>Collect Payment</span>
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

function TrainerDashboardView() {
  const { data: profile } = useMyProfile();
  const { data: members } = useMyMembers({ page: 1, limit: 1 });
  const memberCount = members?.total ?? 0;

  const cards = [
    {
      label: "Assigned Members",
      value: memberCount,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Status",
      value: profile?.status === "ACTIVE" ? "Active" : "Inactive",
      icon: UserCircle,
      color: profile?.status === "ACTIVE" ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Joined",
      value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—",
      icon: Calendar,
      color: "text-text-muted bg-surface-hover",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      <div className="animate-fade-in">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
          Welcome back{profile ? `, ${profile.fullName?.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-secondary mt-1 text-xs font-mono">Trainer dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface border border-border-default rounded-[12px] p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-mono">{card.label}</p>
              <p className="text-lg font-bold text-text-primary tracking-tight">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {profile?.specialization && (
        <div className="bg-surface border border-border-default rounded-[12px] p-4">
          <p className="text-xs text-text-muted font-mono mb-1">Specialization</p>
          <p className="text-sm text-text-primary font-mono">{profile.specialization}</p>
        </div>
      )}
    </div>
  );
}
