import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";
import { cn } from "../../../lib/utils";
import { RevenueDataPoint } from "../../../features/dashboard/hooks/useDashboardRevenue";

interface RevenueChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: RevenueDataPoint[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)", // Strictly using Kyber design tokens
  },
} satisfies ChartConfig;

export function RevenueChart({ data, className, ...props }: RevenueChartProps) {
  return (
    <div className={cn("h-[220px] w-full", className)} {...props}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" strokeOpacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { weekday: "short" });
              }}
              style={{ fontSize: '11px', fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tickFormatter={(value) => `₹${value}`}
              style={{ fontSize: '11px', fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="var(--primary)"
              strokeWidth={2}
              activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
