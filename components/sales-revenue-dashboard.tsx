"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { useSalesInvoices } from "@/hooks/use-sales-invoices";
import { computeSalesDashboardAnalytics } from "@/lib/sales-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  LayoutDashboard,
  Banknote,
  Scale,
  BarChart3,
  Users,
} from "lucide-react";

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatCurrency(amount: number, currency: string = "MYR") {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: currency || "MYR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatCompact(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(amount || 0);
}

export function SalesRevenueDashboard() {
  const { token, isLoading: tokenLoading } = useAuth();
  const { invoices, totalCount, isLoading, isError, errorMessage, refresh } =
    useSalesInvoices({
      token,
      skip: 0,
      top: 800,
      orderby: "docDate desc",
    });

  const analytics = useMemo(
    () => computeSalesDashboardAnalytics(invoices, totalCount),
    [invoices, totalCount]
  );

  const topCustomersChart = useMemo(
    () =>
      [...analytics.topCustomers]
        .reverse()
        .map((c) => ({
          ...c,
          name:
            c.name.length > 28 ? `${c.name.slice(0, 26).trimEnd()}…` : c.name,
        })),
    [analytics.topCustomers]
  );

  if (tokenLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-destructive">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => refresh()} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-24">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasInvoices = invoices.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Revenue, collections, and customer concentration from your latest
            invoices (local currency totals). Use QNE reports for statutory or
            tax-close figures.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sample: {analytics.sampleSize} invoice
            {analytics.sampleSize === 1 ? "" : "s"}
            {analytics.totalCountFromApi > analytics.sampleSize
              ? ` · ${analytics.totalCountFromApi} total in company`
              : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => refresh()}
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!hasInvoices ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutDashboard className="size-5" />
              No data yet
            </CardTitle>
            <CardDescription>
              Invoices will appear here once they load from QNE Cloud.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net revenue</CardTitle>
                <Banknote className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Non-cancelled invoices in sample
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding AR</CardTitle>
                <Scale className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-warning">
                  {formatCurrency(analytics.totalOutstanding)}
                </p>
                <p className="text-xs text-muted-foreground">Still to collect</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active invoices</CardTitle>
                <BarChart3 className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{analytics.activeCount}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.cancelledCount} cancelled in sample
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. invoice value</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(analytics.averageOrderValue)}
                </p>
                <p className="text-xs text-muted-foreground">Mean per active invoice</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Revenue & volume by month</CardTitle>
                <CardDescription>
                  Bars: billed revenue. Line: number of invoices — spot seasonality
                  and workload together.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[320px] w-full min-w-0">
                  {analytics.monthlyTrend.length === 0 ? (
                    <p className="px-6 text-sm text-muted-foreground">
                      Not enough dated invoices to build a monthly trend.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={analytics.monthlyTrend}
                        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                          tickMargin={8}
                        />
                        <YAxis
                          yAxisId="left"
                          tickFormatter={(v) => formatCompact(Number(v))}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                          width={56}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          allowDecimals={false}
                          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                          width={36}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            color: "var(--popover-foreground)",
                          }}
                          formatter={(value, name) => {
                            if (name === "revenue")
                              return [formatCurrency(Number(value)), "Revenue"];
                            return [value, "Invoices"];
                          }}
                        />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="revenue"
                          name="Revenue"
                          fill="var(--chart-1)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="invoiceCount"
                          name="Invoice count"
                          stroke="var(--chart-2)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invoice status mix</CardTitle>
                <CardDescription>
                  Count by collection state — useful for cash-flow and follow-up.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusMix}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={88}
                        paddingAngle={2}
                      >
                        {analytics.statusMix.map((_, i) => (
                          <Cell key={i} fill={CHART_FILLS[i % CHART_FILLS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          color: "var(--popover-foreground)",
                        }}
                        formatter={(value, name, props) => {
                          const rev = Number(
                            (props as { payload?: { revenue?: number } })?.payload
                              ?.revenue ?? 0
                          );
                          if (String(name) === "Cancelled" || rev <= 0) {
                            return [`${value} invoices`, String(name)];
                          }
                          return [
                            `${value} invoices · ${formatCurrency(rev)}`,
                            String(name),
                          ];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top customers by revenue</CardTitle>
              <CardDescription>
                Concentration risk and key accounts — who drives sales in this
                period.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[400px] w-full min-w-0 min-h-[260px]">
                {topCustomersChart.length === 0 ? (
                  <p className="px-6 text-sm text-muted-foreground">No customer breakdown.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCustomersChart}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => formatCompact(Number(v))}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          color: "var(--popover-foreground)",
                        }}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
