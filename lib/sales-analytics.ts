import type { SalesInvoice } from "@/lib/types";

const PAID_EPS = 0.01;

export function amountLocal(inv: SalesInvoice): number {
  const v = inv.netTotalAmountLocal ?? inv.netTotalAmount ?? 0;
  return Number.isFinite(v) ? v : 0;
}

export function outstandingLocal(inv: SalesInvoice): number {
  const v = inv.outstandingAmountLocal ?? inv.outstandingAmount ?? 0;
  return Number.isFinite(v) ? v : 0;
}

function monthSortKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(sortKey: string): string {
  const [ys, ms] = sortKey.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return sortKey;
  return new Date(y, m - 1, 1).toLocaleDateString("en-MY", {
    month: "short",
    year: "numeric",
  });
}

export interface MonthlyTrendPoint {
  monthKey: string;
  month: string;
  revenue: number;
  invoiceCount: number;
}

export interface TopCustomerRow {
  name: string;
  revenue: number;
  invoiceCount: number;
}

export interface StatusSlice {
  name: string;
  value: number;
  revenue: number;
}

export interface SalesDashboardAnalytics {
  sampleSize: number;
  totalCountFromApi: number;
  /** Active (non-cancelled) invoices in sample */
  activeCount: number;
  totalRevenue: number;
  totalOutstanding: number;
  cancelledCount: number;
  averageOrderValue: number;
  monthlyTrend: MonthlyTrendPoint[];
  topCustomers: TopCustomerRow[];
  statusMix: StatusSlice[];
}

export function computeSalesDashboardAnalytics(
  invoices: SalesInvoice[],
  totalCountFromApi: number
): SalesDashboardAnalytics {
  const active = invoices.filter((i) => !i.isCancelled);
  const cancelled = invoices.filter((i) => i.isCancelled);

  const totalRevenue = active.reduce((sum, i) => sum + amountLocal(i), 0);
  const totalOutstanding = active.reduce((sum, i) => sum + outstandingLocal(i), 0);
  const activeCount = active.length;
  const averageOrderValue =
    activeCount > 0 ? totalRevenue / activeCount : 0;

  const byMonth = new Map<
    string,
    { revenue: number; invoiceCount: number }
  >();
  for (const inv of active) {
    const key = monthSortKey(inv.docDate);
    if (!key) continue;
    const cur = byMonth.get(key) ?? { revenue: 0, invoiceCount: 0 };
    cur.revenue += amountLocal(inv);
    cur.invoiceCount += 1;
    byMonth.set(key, cur);
  }
  const monthKeys = [...byMonth.keys()].sort();
  const monthlyTrend: MonthlyTrendPoint[] = monthKeys.map((monthKey) => {
    const row = byMonth.get(monthKey)!;
    return {
      monthKey,
      month: monthLabel(monthKey),
      revenue: row.revenue,
      invoiceCount: row.invoiceCount,
    };
  });

  const byCustomer = new Map<
    string,
    { revenue: number; invoiceCount: number }
  >();
  for (const inv of active) {
    const name =
      (inv.customerName || inv.invoiceTo || inv.customerCode || "Unknown").trim() ||
      "Unknown";
    const cur = byCustomer.get(name) ?? { revenue: 0, invoiceCount: 0 };
    cur.revenue += amountLocal(inv);
    cur.invoiceCount += 1;
    byCustomer.set(name, cur);
  }
  const topCustomers: TopCustomerRow[] = [...byCustomer.entries()]
    .map(([name, v]) => ({
      name,
      revenue: v.revenue,
      invoiceCount: v.invoiceCount,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  let paidCount = 0;
  let outstandingCount = 0;
  let paidRevenue = 0;
  let outstandingRevenue = 0;
  for (const inv of active) {
    const out = outstandingLocal(inv);
    if (out <= PAID_EPS) {
      paidCount += 1;
      paidRevenue += amountLocal(inv);
    } else {
      outstandingCount += 1;
      outstandingRevenue += amountLocal(inv);
    }
  }
  const statusMix: StatusSlice[] = [
    { name: "Paid", value: paidCount, revenue: paidRevenue },
    { name: "Outstanding", value: outstandingCount, revenue: outstandingRevenue },
    { name: "Cancelled", value: cancelled.length, revenue: 0 },
  ].filter((s) => s.value > 0);

  return {
    sampleSize: invoices.length,
    totalCountFromApi,
    activeCount,
    totalRevenue,
    totalOutstanding,
    cancelledCount: cancelled.length,
    averageOrderValue,
    monthlyTrend,
    topCustomers,
    statusMix,
  };
}
