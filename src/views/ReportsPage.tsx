"use client";

import { useMemo, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import {
  Loader2,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Wallet,
  PieChart,
  Target,
} from "lucide-react";
import { Analytics } from "@/components/dashboard/Analytics";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "all";
type PaymentFilter = "all" | "paid" | "unpaid";

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
  const { orders, isOrdersLoading, categories } = useOrderStore();
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
      const paid = (order.status ?? "").toLowerCase() === "lunas" || order.data?.["STATUS"] === "LUNAS";
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
    let totalRevenue = 0;
    let totalUnits = 0;
    const categoryStats = new Map<string, { count: number; revenue: number; name: string }>();

    filteredOrders.forEach((order) => {
      const cat = categories.find(c => c.id === order.categoryId);
      const qty = resolveQuantity(order.data);
      const price = cat?.pricePerPc || 0;
      const revenue = qty * price;

      totalUnits += qty;
      totalRevenue += revenue;

      const catId = order.categoryId || "uncategorized";
      const current = categoryStats.get(catId) || { count: 0, revenue: 0, name: cat?.name || "Uncategorized" };
      categoryStats.set(catId, {
        count: current.count + 1,
        revenue: current.revenue + revenue,
        name: current.name
      });
    });

    const totalOrders = filteredOrders.length;
    const uniqueCustomers = new Set(filteredOrders.map((order) => order.phone).filter(Boolean)).size;
    const paidOrders = filteredOrders.filter((order) => (order.status ?? "").toLowerCase() === "lunas" || order.data?.["STATUS"] === "LUNAS").length;
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

    const topCategories = Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue)
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
      topCategories,
    };
  }, [filteredOrders, categories]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card p-3 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2 sm:p-2.5 bg-primary/10 text-primary rounded-lg">
            <PieChart size={18} className="sm:size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-primary uppercase">Business Analytics</h2>
            <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-widest mt-0.5">
              Data-driven insights
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex gap-1.5 p-1 bg-muted/30 rounded-lg sm:rounded-xl">
            {(["7d", "30d", "all"] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={cn(
                  "flex-1 sm:flex-none h-7 sm:h-8 px-2 sm:px-4 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                  dateRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {range === "7d" ? "7D" : range === "30d" ? "30D" : "All"}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 p-1 bg-muted/30 rounded-lg sm:rounded-xl">
            {(["all", "paid", "unpaid"] as PaymentFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setPaymentFilter(filter)}
                className={cn(
                  "flex-1 sm:flex-none h-7 sm:h-8 px-2 sm:px-4 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                  paymentFilter === filter
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {filter === "all" ? "All" : filter === "paid" ? "Paid" : "Unpaid"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {isOrdersLoading ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <Loader2 className="text-primary/40 animate-spin" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Analyzing data...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-8">
          {/* Key Metrics */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            <article className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05]">
                <DollarSign size={80} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Revenue</p>
              <h3 className="text-sm sm:text-2xl font-black text-primary truncate">Rp {metrics.totalRevenue.toLocaleString("id-ID")}</h3>
              <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase">
                <TrendingUp size={10} className="sm:size-12" /> Actual Earnings
              </div>
            </article>

            <article className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05]">
                <ShoppingBag size={80} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Units</p>
              <h3 className="text-sm sm:text-2xl font-black text-foreground">{metrics.totalUnits}</h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-2 sm:mt-3">Total orders: {metrics.totalOrders}</p>
            </article>

            <article className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05]">
                <Users size={80} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Customers</p>
              <h3 className="text-sm sm:text-2xl font-black text-foreground">{metrics.uniqueCustomers}</h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-2 sm:mt-3">Unique contacts</p>
            </article>

            <article className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05]">
                <Wallet size={80} />
              </div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Average</p>
              <h3 className="text-sm sm:text-2xl font-black text-foreground truncate">Rp {metrics.averageTicket.toLocaleString("id-ID")}</h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-2 sm:mt-3">Per transaction</p>
            </article>
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
            <div className="xl:col-span-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-primary rounded-full" />
                  <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground">Order Volume Trend</h4>
                </div>
                <div className="text-[8px] sm:text-[10px] font-bold text-muted-foreground flex items-center gap-1 sm:gap-1.5 uppercase">
                  <TrendingUp size={12} className="text-emerald-500" />
                  Activity history
                </div>
              </div>

              {metrics.trend.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10 sm:py-12">
                   <Target size={24} className="mb-2 sm:size-32" />
                   <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Insufficient data</p>
                </div>
              ) : (
                <div className="flex-1 min-h-[160px] sm:min-h-[200px] flex items-end gap-1 sm:gap-3 pb-1 overflow-hidden">
                  {metrics.trend.map((point) => {
                    const height = metrics.maxTrend ? Math.max(12, (point.count / metrics.maxTrend) * 100) : 0;
                    return (
                      <div key={point.day} className="flex-1 flex flex-col items-center justify-end gap-2 sm:gap-3 h-full">
                        <div className="w-full relative group">
                          <div
                            className="w-full rounded-t-sm sm:rounded-t-lg bg-primary/20 group-hover:bg-primary/40 transition-colors"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {point.count}
                          </div>
                        </div>
                        <span className="text-[7px] sm:text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                          {point.day.slice(8)}/{point.day.slice(5, 7)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="xl:col-span-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-secondary rounded-full" />
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground">Category Share</h4>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                {metrics.topCategories.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground opacity-50 py-10 text-center uppercase font-bold tracking-widest">No category data</p>
                ) : (
                  metrics.topCategories.map((cat, idx) => {
                    const percentage = Math.round((cat.revenue / metrics.totalRevenue) * 100);
                    return (
                      <div key={cat.name} className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                          <span className="text-muted-foreground truncate pr-2">{cat.name}</span>
                          <span className="text-foreground shrink-0">Rp {cat.revenue.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden flex">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              idx === 0 ? "bg-primary" : idx === 1 ? "bg-secondary" : "bg-blue-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/60">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Paid Ratio</span>
                  <span className="text-[10px] sm:text-xs font-black text-emerald-600">{metrics.paymentRate}%</span>
                </div>
                <div className="h-2 sm:h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${metrics.paymentRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Secondary Stats */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <Analytics orders={filteredOrders} className="h-full" />
            
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1 h-4 sm:w-1.5 sm:h-5 bg-blue-500 rounded-full" />
                  <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground">Activity Summary</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Paid Orders</p>
                  <p className="text-lg sm:text-2xl font-black text-primary">{metrics.paidOrders}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Pending</p>
                  <p className="text-lg sm:text-2xl font-black text-secondary">{metrics.totalOrders - metrics.paidOrders}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2.5 sm:gap-3">
                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                     <Target size={16} className="sm:size-20" />
                   </div>
                   <div>
                     <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none mb-1">Insights</p>
                     <p className="text-[10px] sm:text-xs font-bold text-foreground leading-tight">
                       {metrics.paymentRate > 70 ? "Healthy cashflow detected." : "High pending payments. Action needed."}
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
