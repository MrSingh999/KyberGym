import React from "react";
import { Greeting } from "../components/Greeting";
import { QuickActions } from "../components/QuickActions";
import { KpiGrid } from "../components/KpiGrid";
import { ActivityFeed } from "../components/ActivityFeed";
import { ExpiringWidget } from "../components/ExpiringWidget";
import { RevenueChart } from "../../../components/data-display/charts/RevenueChart";
import { WidgetContainer, WidgetHeader, WidgetBody } from "../widgets/WidgetContainer";
import { useDashboardRevenue } from "../hooks/useDashboardRevenue";

export function DashboardPage() {
  const { data: revenueData, isLoading: isRevenueLoading } = useDashboardRevenue();

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto">
      <Greeting />
      <QuickActions />
      <KpiGrid />
      
      {/* Mobile: 1 column. Desktop: 3 column grid (2 for chart, 1 for feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <WidgetContainer className="h-full min-h-[350px]">
            <WidgetHeader title="Revenue Trend" description="Past 7 days collection vs active members" />
            <WidgetBody isLoading={isRevenueLoading} isEmpty={revenueData?.length === 0}>
              {revenueData && <RevenueChart data={revenueData} />}
            </WidgetBody>
          </WidgetContainer>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpiringWidget />
        </div>
        {/* Placeholder for future widgets (e.g. Broadcasts, Popular Plans) */}
        <div className="lg:col-span-2 hidden lg:block">
          <WidgetContainer className="h-full bg-surface-hover border border-dashed border-default shadow-none">
            <WidgetBody isEmpty emptyState={
              <div className="text-center">
                <p className="text-sm font-medium text-primary">Custom Dashboard</p>
                <p className="text-xs text-secondary mt-1">Drag and drop widgets to customize</p>
              </div>
            } />
          </WidgetContainer>
        </div>
      </div>
    </div>
  );
}
