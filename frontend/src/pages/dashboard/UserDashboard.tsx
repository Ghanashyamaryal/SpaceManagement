import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck, CalendarPlus, UtensilsCrossed, Wallet } from "lucide-react";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { useFetch } from "@/hooks/queryFn";
import type { MyDashboardSummary } from "@/lib/types/dashboard";
import { StatCard } from "./components/StatCard";
import { ChartCard, EmptyChart } from "./components/ChartCard";
import { CHART_COLORS, formatCurrency, monthLabel, statusToData } from "./components/helpers";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

const trendConfig = {
  count: { label: "Bookings", color: "var(--chart-1)" },
} satisfies ChartConfig;

const canteenConfig = {
  value: { label: "Orders", color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function UserDashboard() {
  const { data, isLoading, error } = useFetch<MyDashboardSummary>({
    path: "/api/dashboard/my-summary",
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load dashboard: {error ?? "Unknown error"}
      </div>
    );
  }

  const trend = data.myBookingsTrend.map((p) => ({ ...p, label: monthLabel(p.month) }));
  const statusData = statusToData(data.myBookings.byStatus);
  const canteenData = statusToData(data.myCanteenOrders.byStatus);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your activity at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My Bookings"
          value={data.myBookings.total.toLocaleString()}
          hint={`${data.myBookings.thisMonth} this month`}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Bookings This Month"
          value={data.myBookings.thisMonth.toLocaleString()}
          icon={<CalendarPlus className="h-5 w-5" />}
        />
        <StatCard
          label="Canteen Orders"
          value={data.myCanteenOrders.total.toLocaleString()}
          icon={<UtensilsCrossed className="h-5 w-5" />}
        />
        <StatCard
          label="Credit Balance"
          value={formatCurrency(data.myCredit.balance)}
          hint={data.myCredit.balance > 0 ? "Outstanding" : "Settled"}
          hintClassName={data.myCredit.balance > 0 ? "text-destructive" : undefined}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="My Bookings"
          description="Last 6 months"
          className="lg:col-span-2"
        >
          {trend.length ? (
            <ChartContainer config={trendConfig} className="aspect-[3/1] w-full">
              <LineChart data={trend} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="count"
                  type="monotone"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Bookings by Status" description="All time">
          {statusData.length ? (
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[260px]">
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
            <EmptyChart message="No bookings yet" />
          )}
        </ChartCard>

        <ChartCard title="Canteen Orders by Status" description="All time">
          {canteenData.length ? (
            <ChartContainer config={canteenConfig} className="aspect-square max-h-[260px] w-full">
              <BarChart data={canteenData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={4}>
                  {canteenData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChart message="No canteen orders yet" />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
