"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SalesInvoice } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface KPICardsProps {
  invoices: SalesInvoice[];
  isLoading: boolean;
}

export function KPICards({ invoices, isLoading }: KPICardsProps) {
  const stats = calculateStats(invoices);

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subValue: `${stats.totalInvoices} invoices`,
      icon: DollarSign,
      trend: null,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Paid",
      value: formatCurrency(stats.paidAmount),
      subValue: `${stats.paidCount} invoices`,
      icon: CheckCircle2,
      trend: stats.paidPercentage,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstandingAmount),
      subValue: `${stats.outstandingCount} invoices`,
      icon: AlertCircle,
      trend: stats.outstandingPercentage,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Average Invoice",
      value: formatCurrency(stats.averageInvoice),
      subValue: "per invoice",
      icon: FileText,
      trend: null,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </p>
              <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {kpi.subValue}
                </span>
                {kpi.trend !== null && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      kpi.title === "Outstanding"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {kpi.title === "Outstanding" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {kpi.trend.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function calculateStats(invoices: SalesInvoice[]) {
  const validInvoices = invoices.filter((inv) => !inv.isCancelled);

  const totalRevenue = validInvoices.reduce(
    (sum, inv) => sum + (inv.netTotalAmount || 0),
    0
  );
  const outstandingAmount = validInvoices.reduce(
    (sum, inv) => sum + (inv.outstandingAmount || 0),
    0
  );
  const paidAmount = totalRevenue - outstandingAmount;

  const paidInvoices = validInvoices.filter(
    (inv) => inv.outstandingAmount === 0
  );
  const outstandingInvoices = validInvoices.filter(
    (inv) => inv.outstandingAmount > 0
  );

  return {
    totalRevenue,
    totalInvoices: validInvoices.length,
    paidAmount,
    paidCount: paidInvoices.length,
    outstandingAmount,
    outstandingCount: outstandingInvoices.length,
    averageInvoice: validInvoices.length > 0 ? totalRevenue / validInvoices.length : 0,
    paidPercentage: totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0,
    outstandingPercentage: totalRevenue > 0 ? (outstandingAmount / totalRevenue) * 100 : 0,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
