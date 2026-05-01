"use client";

import { useMemo, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import {
  Loader2,
  FileText,
  DollarSign,
  Users,
  ShoppingBag,
  Clock3,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Analytics } from "@/components/dashboard/Analytics";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "all";
type PaymentFilter = "all" | "paid" | "unpaid";

const PRICE_PER_UNIT = 150000;

function resolveQuantity(data: Record<string, unknown> = {}): number {
  const known = ["Quantity", "quantity", "qty", "Qty", "jumlah", "Jumlah"];
  const key = known.find((item) => data[item] !== undefined);
  return Number(data[key ?? ""]) || 1;
}

function resolveCreatedAt(input?: string): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function ReportsPage() {
  const { orders, isOrdersLoading } = useOrderStore();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  const now = useMemo(() => new Date(), []);

  const filteredOrders = useMemo(() => {
    const startDate = (() => {
      if (dateRange === "all") return null;
      const date = new Date(now);
      date.setDate(now.getDate() - (dateRange === "7d" ? 7 : 30));
      return date;
    })();

    return orders.filter((order) => {
      const paid = (order.status ?? "").toLowerCase() === "lunas";
      const paymentMatch =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && paid) ||
        (paymentFilter === "unpaid" && !paid);

      if (!paymentMatch) return false;

      if (!startDate) return true;
      const createdAt = resolveCreatedAt(order.createdAt);
      if (!createdAt) return false;
      return createdAt >= startDate;
    });
  }, [orders, dateRange, paymentFilter, now]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalUnits = filteredOrders.reduce((sum, order) => sum + resolveQuantity(order.data), 0);
    const totalRevenue = totalUnits * PRICE_PER_UNIT;
    const uniqueCustomers = new Set(filteredOrders.map((order) => order.phone).filter(Boolean)).size;
    const paidOrders = filteredOrders.filter((order) => (order.status ?? "").toLowerCase() === "lunas").length;
    const paymentRate = totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0;

    const orderByDay = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const date = resolveCreatedAt(order.createdAt);
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      orderByDay.set(key, (orderByDay.get(key) ?? 0) + 1);
    });

    const trend = Array.from(orderByDay.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-10);

    const maxTrend = trend.reduce((max, point) => Math.max(max, point.count), 0);
    const averageTicket = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    const topCustomers = Array.from(
      filteredOrders.reduce<Map<string, number>>((map, order) => {
        if (!order.phone) return map;
        map.set(order.phone, (map.get(order.phone) ?? 0) + 1);
        return map;
      }, new Map()),
    )
      .map(([phone, count]) => ({ phone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      totalUnits,
      totalRevenue,
      uniqueCustomers,
      paidOrders,
      paymentRate,
      trend,
      maxTrend,
      averageTicket,
      topCustomers,
    };
  }, [filteredOrders]);

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-primary">Business Reports</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Analisis performa order dengan filter periode dan status pembayaran.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {(["7d", "30d", "all"] as DateRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={cn(
                "h-8 px-3 sm:px-4 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                dateRange === range
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 text-muted-foreground border-border",
              )}
            >
              {range === "7d" ? "7 Hari" : range === "30d" ? "30 Hari" : "Semua"}
            </button>
          ))}

          {(["all", "paid", "unpaid"] as PaymentFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setPaymentFilter(filter)}
              className={cn(
                "h-8 px-3 sm:px-4 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                paymentFilter === filter
                  ? "bg-secondary text-secondary-foreground border-secondary/60"
                  : "bg-muted/30 text-muted-foreground border-border",
              )}
            >
              {filter === "all" ? "Semua Payment" : filter === "paid" ? "Lunas" : "Belum Lunas"}
            </button>
          ))}
        </div>
      </header>

      {isOrdersLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <article className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Revenue</p>
                  <h3 className="text-xl sm:text-2xl font-black">Rp {metrics.totalRevenue.toLocaleString("id-ID")}</h3>
                </div>
              </div>
            </article>

            <article className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pelanggan Unik</p>
                  <h3 className="text-xl sm:text-2xl font-black">{metrics.uniqueCustomers}</h3>
                </div>
              </div>
            </article>

            <article className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Jumlah Order</p>
                  <h3 className="text-xl sm:text-2xl font-black">{metrics.totalOrders}</h3>
                </div>
              </div>
            </article>

            <article className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Wallet size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Avg Ticket</p>
                  <h3 className="text-xl sm:text-2xl font-black">Rp {metrics.averageTicket.toLocaleString("id-ID")}</h3>
                </div>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3 p-5 rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-foreground">Tren Order Harian</h4>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  10 hari terakhir
                </div>
              </div>

              {metrics.trend.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">Belum ada data tren pada filter ini.</p>
              ) : (
                <div className="grid grid-cols-10 items-end gap-2 h-44">
                  {metrics.trend.map((point) => {
                    const height = metrics.maxTrend ? Math.max(10, (point.count / metrics.maxTrend) * 100) : 0;
                    return (
                      <div key={point.day} className="flex flex-col items-center justify-end gap-2 h-full">
                        <div
                          className="w-full rounded-md bg-primary/80 hover:bg-primary transition-colors"
                          style={{ height: `${height}%` }}
                          title={`${point.day}: ${point.count} order`}
                        />
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {point.day.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="xl:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">Ringkasan Pembayaran</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock3 size={14} /> Paid Rate
                  </span>
                  <span className="font-black">{metrics.paymentRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.paymentRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="rounded-xl border border-border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Paid</p>
                    <p className="text-lg font-black">{metrics.paidOrders}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Unpaid</p>
                    <p className="text-lg font-black">{metrics.totalOrders - metrics.paidOrders}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Units</p>
                    <p className="text-lg font-black">{metrics.totalUnits}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3">
              <Analytics orders={filteredOrders} />
            </div>
            <div className="xl:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">Top Customers</h4>
              {metrics.topCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada pelanggan pada filter ini.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.topCustomers.map((customer, index) => (
                    <div
                      key={customer.phone}
                      className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        #{index + 1} {customer.phone}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {customer.count} order
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
