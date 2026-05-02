"use client";

import { useMemo } from "react";
import { Order } from "@/services/orders";
import { cn } from "@/lib/utils";

interface AnalyticsProps {
  orders: Order[];
  className?: string;
}

export function Analytics({ orders, className }: AnalyticsProps) {
  const metrics = useMemo(() => {
    if (orders.length === 0) {
      return {
        totalQuantity: 0,
        sizeCounts: {} as Record<string, number>,
      };
    }

    const findKey = (patterns: string[]) => {
      const keys = Object.keys(orders[0].data || {});
      return keys.find((key) => patterns.some((pattern) => key.toLowerCase().includes(pattern)));
    };

    const qtyKey = findKey(["qty", "quantity", "jumlah"]);
    const sizeKey = findKey(["size", "ukuran"]);
    const totalQuantity = orders.reduce((acc, order) => acc + (Number(order.data[qtyKey || ""]) || 1), 0);

    const sizeCounts: Record<string, number> = {};
    if (sizeKey) {
      orders.forEach((order) => {
        const sizeValue = String(order.data[sizeKey] || "Other");
        sizeCounts[sizeValue] = (sizeCounts[sizeValue] || 0) + (Number(order.data[qtyKey || ""]) || 1);
      });
    }

    return { totalQuantity, sizeCounts };
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className={cn("p-5 rounded-2xl border border-border bg-card shadow-sm", className)}>
        <p className="text-sm text-muted-foreground">Belum ada data size untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className={cn("p-5 rounded-2xl border border-border bg-card shadow-sm space-y-5", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-wider text-foreground">Size Analysis</h4>
        <span className="text-xs font-semibold text-muted-foreground">
          Total units: {metrics.totalQuantity}
        </span>
      </div>

      {Object.keys(metrics.sizeCounts).length === 0 ? (
        <p className="text-sm text-muted-foreground">Kolom size/ukuran belum tersedia pada data order.</p>
      ) : (
        <>
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            {Object.entries(metrics.sizeCounts).map(([size, count], index) => {
              const percentage = (count / metrics.totalQuantity) * 100;
              const palette = [
                "bg-blue-500",
                "bg-emerald-500",
                "bg-orange-500",
                "bg-purple-500",
                "bg-rose-500",
              ];

              return (
                <div
                  key={size}
                  className={cn("h-full", palette[index % palette.length])}
                  style={{ width: `${percentage}%` }}
                  title={`${size}: ${count} units`}
                />
              );
            })}
          </div>

          <div className="space-y-2.5">
            {Object.entries(metrics.sizeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([size, count], index) => {
                const percentage = metrics.totalQuantity ? Math.round((count / metrics.totalQuantity) * 100) : 0;
                const palette = [
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-orange-500",
                  "bg-purple-500",
                  "bg-rose-500",
                ];

                return (
                  <div key={size} className="rounded-xl border border-border px-3 py-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", palette[index % palette.length])} />
                        <span className="font-semibold">{size}</span>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {count} units ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
