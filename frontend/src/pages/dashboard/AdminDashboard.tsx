import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { useFetch } from "@/hooks/queryFn";
import type { DashboardSummary } from "@/lib/types/dashboard";
import { StatCard } from "./components/StatCard";
import { ChartCard, EmptyChart } from "./components/ChartCard";
import {
  CHART_COLORS,
  deltaLabel,
  formatCurrency,
  monthLabel,
  statusToData,
} from "./components/helpers";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

const trendConfig = {
  count: { label: "Bookings", color: "var(--chart-1)" },
  revenue: { label: "Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

const typeConfig = {
  count: { label: "Workspaces", color: "var(--chart-3)" },
} satisfies ChartConfig;

function prettyType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useFetch<DashboardSummary>({
    path: "/api/dashboard/summary",
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load dashboard: {error ?? "Unknown error"}
      </div>
    );
  }

  const trend = data.bookingsTrend.map((p) => ({ ...p, label: monthLabel(p.month) }));
  const statusData = statusToData(data.bookings.byStatus);
  const typeData = data.workspacesByType.map((w) => ({
    name: prettyType(w.type),
    count: w.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {data.scope === "global"
            ? "Overview across all branches"
            : "Overview for your branch"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={data.bookings.total.toLocaleString()}
          hint={`${data.bookings.thisMonth} this month`}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Revenue (This Month)"
          value={formatCurrency(data.revenue.thisMonth)}
          hint={`${deltaLabel(data.revenue.thisMonth, data.revenue.lastMonth)} vs last month`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Members"
          value={data.members.total.toLocaleString()}
          hint={`${data.members.newThisMonth} new this month`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Occupancy Today"
          value={`${data.occupancy.percent}%`}
          hint={`${data.occupancy.occupiedToday}/${data.occupancy.totalWorkspaces} workspaces`}
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bookings & Revenue"
          description="Last 6 months"
          className="lg:col-span-2"
        >
          {trend.length ? (
            <ChartContainer config={trendConfig} className="aspect-[3/1] w-full">
              <AreaChart data={trend} margin={{ left: 8, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  stroke="var(--color-count)"
                  fill="url(#fillCount)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Bookings by Status" description="All time">
          {statusData.length ? (
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[260px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Workspaces by Type" description="Current inventory">
          {typeData.length ? (
            <ChartContainer config={typeConfig} className="aspect-square max-h-[260px] w-full">
              <BarChart data={typeData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
