"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SalesInvoice } from "@/lib/types";

interface TopCustomersChartProps {
  invoices: SalesInvoice[];
  isLoading: boolean;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  outstanding: {
    label: "Outstanding",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function TopCustomersChart({
  invoices,
  isLoading,
}: TopCustomersChartProps) {
  const chartData = useMemo(() => {
    const validInvoices = invoices.filter((inv) => !inv.isCancelled);

    // Group by customer
    const customerData: Record<
      string,
      { name: string; revenue: number; outstanding: number }
    > = {};

    validInvoices.forEach((invoice) => {
      const customerName = invoice.customerName || invoice.invoiceTo || "Unknown";
      const key = invoice.customerCode || customerName;

      if (!customerData[key]) {
        customerData[key] = { name: customerName, revenue: 0, outstanding: 0 };
      }

      customerData[key].revenue += invoice.netTotalAmount || 0;
      customerData[key].outstanding += invoice.outstandingAmount || 0;
    });

    return Object.values(customerData)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        name: item.name.length > 20 ? item.name.slice(0, 18) + "..." : item.name,
        fullName: item.name,
      }));
  }, [invoices]);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Top Customers</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-chart-3" />
              <span className="text-muted-foreground">Outstanding</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-MY", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              width={110}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {item.payload.fullName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{name}:</span>
                        <span className="font-mono font-medium">
                          {new Intl.NumberFormat("en-MY", {
                            style: "currency",
                            currency: "MYR",
                          }).format(value as number)}
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
            <Bar
              dataKey="outstanding"
              fill="var(--chart-3)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
