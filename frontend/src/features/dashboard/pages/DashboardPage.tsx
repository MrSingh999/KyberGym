import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, Calendar, Phone, CheckCircle, Clock } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDashboardDues } from "../hooks/useDashboardDues";
import { useDashboardRevenue } from "../hooks/useDashboardRevenue";
import { KpiGrid } from "../components/KpiGrid";
import { QuickActions } from "../components/QuickActions";
import { ActivityFeed } from "../components/ActivityFeed";
import { RevenueChart } from "../../../components/data-display/charts/RevenueChart";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { CreateMemberWizard } from "../../members/components/CreateMemberWizard";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [dueTimeframe, setDueTimeframe] = useState<"today" | "3days" | "7days">("7days");

  const { data: stats } = useDashboardStats();
  const { data: dues, isLoading: isDuesLoading } = useDashboardDues();
  const { data: revenueData, isLoading: isRevenueLoading } = useDashboardRevenue();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeDues = 
    dueTimeframe === "today" ? dues?.dueToday || [] :
    dueTimeframe === "3days" ? dues?.dueIn3Days || [] :
    dues?.dueIn7Days || [];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-slide-up">
      
      {/* Console Overview Header */}
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
          className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-[6px] font-semibold text-xs transition-opacity duration-150 cursor-pointer border border-border-hover flex items-center gap-2"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register Member</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <KpiGrid />

      {/* Quick Actions (B&W minimal) */}
      <QuickActions />

      {/* Main Grid: Dues Tracker and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dues Tracker Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-4 sm:p-5 md:p-6 rounded-[16px] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-default pb-4">
              <div className="space-y-1.5">
                <h2 className="font-bold text-base text-text-primary font-mono uppercase tracking-wide">
                  Membership Dues Tracker
                </h2>
                <p className="text-xs text-text-secondary">
                  Active memberships expiring within the selected timeframe.
                </p>
              </div>

              {/* Timeframe Selector Pills */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider font-mono shrink-0">
                  Timeframe:
                </span>
                <div className="flex bg-canvas border border-border-default p-0.5 rounded-[6px]">
                  {[
                    { val: "today", label: "Today" },
                    { val: "3days", label: "3 Days" },
                    { val: "7days", label: "7 Days" },
                  ].map((tf) => (
                    <button
                      key={tf.val}
                      type="button"
                      onClick={() => setDueTimeframe(tf.val as any)}
                      className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        dueTimeframe === tf.val
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List / Grid of dues */}
            {isDuesLoading ? (
              <div className="text-center py-14">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-border-default border-t-text-primary mx-auto mb-2"></div>
                <p className="text-text-muted text-xs font-mono uppercase tracking-wider">Loading dues tracker...</p>
              </div>
            ) : activeDues.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-12 h-12 border border-border-default rounded-[8px] flex items-center justify-center mx-auto mb-4 text-text-secondary">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1 font-mono">
                  Diagnostics Clear
                </h3>
                <p className="text-text-secondary text-xs max-w-sm mx-auto mb-6">
                  No active billing records are pending or expiring under the current configuration parameters.
                </p>
                <Button
                  onClick={() => setIsAddMemberOpen(true)}
                  variant="outline"
                  className="text-xs flex items-center gap-2 mx-auto"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register Member</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {activeDues.map((member, idx) => {
                  const daysDiff = getDaysDiff(member.endDate);
                  const isOverdue = daysDiff < 0;

                  return (
                    <div
                      key={member._id || idx}
                      className={`p-4 rounded-[8px] border transition-all duration-200 ${
                        isOverdue
                          ? "bg-error/[0.01] border-error/20 hover:border-error/35 border-l-[3px] border-l-error"
                          : "bg-warning/[0.01] border-warning/20 hover:border-warning/35 border-l-[3px] border-l-warning"
                      }`}
                    >
                      <div className="flex flex-col justify-between h-full gap-4">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-text-primary truncate">
                            {member.memberId?.fullName || "Gym Member"}
                          </h4>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`inline-flex items-center space-x-1 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                isOverdue
                                  ? "bg-error/10 text-error"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              <span
                                className={`status-dot ${isOverdue ? "status-dot-overdue" : "status-dot-due"}`}
                              ></span>
                              <span>{isOverdue ? "overdue" : "due soon"}</span>
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {member.memberId?.memberCode}
                            </span>
                          </div>

                          <div className="flex items-center text-xs text-text-secondary gap-1.5 font-mono">
                            <Phone className="h-3.5 w-3.5 text-text-muted" />
                            <span>{member.memberId?.phone || "No phone"}</span>
                          </div>

                          <div className="flex items-center text-xs text-text-secondary gap-1.5 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-text-muted" />
                            <span>
                              Due:{" "}
                              <strong className="text-text-primary">
                                {formatDate(member.endDate)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border-default pt-3 mt-1">
                          <div>
                            <p className="text-[9px] text-text-muted uppercase font-semibold font-mono">
                              Dues Amount
                            </p>
                            <p className="text-sm font-bold text-text-primary font-mono">
                              ₹{(member.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            {isOverdue ? (
                              <span className="text-[10px] text-error font-semibold font-mono block mb-1">
                                Expired {Math.abs(daysDiff)}d ago
                              </span>
                            ) : (
                              <span className="text-[10px] text-warning font-semibold font-mono block mb-1">
                                Expires in {daysDiff}d
                              </span>
                            )}
                            <Button
                              size="xs"
                              onClick={() => navigate("/admin/payments/collect")}
                              className="text-[10px] font-bold h-7"
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
        </div>

        {/* Activity Feed Column */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Revenue Chart Section (Full width / lower hierarchy) */}
      <WidgetContainer className="min-h-[350px]">
        <WidgetHeader title="Revenue Trend" description="Past 7 days collection vs active members" />
        <WidgetBody isLoading={isRevenueLoading} isEmpty={revenueData?.length === 0}>
          {revenueData && <RevenueChart data={revenueData} />}
        </WidgetBody>
      </WidgetContainer>

      {/* Register Member Modal Wizard */}
      <ResponsiveModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        title="Register Gym Member"
      >
        <CreateMemberWizard
          onSuccess={() => {
            setIsAddMemberOpen(false);
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          }}
          onCancel={() => setIsAddMemberOpen(false)}
        />
      </ResponsiveModal>

    </div>
  );
}
