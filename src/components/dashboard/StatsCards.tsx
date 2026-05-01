"use client";

import { ShoppingBag, CheckCircle, Clock, Users } from "lucide-react";
import { Order } from "@/services/orders";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  orders: Order[];
}

export function StatsCards({ orders }: StatsCardsProps) {
  // Dynamically find 'Quantity' (or similar) from data
  const findQtyKey = () => {
    if (orders.length === 0) return null;
    const keys = Object.keys(orders[0].data || {});
    return keys.find(k => ['qty', 'quantity', 'jumlah'].some(p => k.toLowerCase().includes(p)));
  };

  const qtyKey = findQtyKey();
  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, o) => sum + (Number(o.data[qtyKey || '']) || 1), 0);
  const lunasItems = orders
    .filter((o) => o.status === "Lunas")
    .reduce((sum, o) => sum + (Number(o.data[qtyKey || '']) || 1), 0);
  const pendingItems = totalItems - lunasItems;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Users,
      color: "blue",
      description: "Unique orders tracked"
    },
    {
      label: "Total Items",
      value: totalItems,
      icon: ShoppingBag,
      color: "primary",
      description: "Total quantity ordered"
    },
    {
      label: "Lunas (Items)",
      value: lunasItems,
      icon: CheckCircle,
      color: "secondary",
      description: "Quantity paid in full"
    },
    {
      label: "Pending",
      value: pendingItems,
      icon: Clock,
      color: "accent",
      description: "Waiting for payment"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {stats.map((stat, idx) => (
        <div 
          key={stat.label}
          className="relative group overflow-hidden p-3.5 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border bg-card/50 shadow-sm border-border/60 dark:border-white/5"
        >
          {/* Decorative Background Icon */}
          <stat.icon className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-20 sm:h-20 opacity-[0.04]" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "p-2.5 rounded-lg shadow-sm",
              stat.color === "primary" ? "bg-primary text-primary-foreground shadow-primary/20" : 
              stat.color === "secondary" ? "bg-secondary text-secondary-foreground shadow-secondary/20" : 
              stat.color === "blue" ? "bg-blue-600/90 text-white shadow-blue-600/20" :
              "bg-accent text-accent-foreground shadow-accent/20"
            )}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground">{stat.value}</h3>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between relative z-10">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.description}</p>
            {stat.label === "Lunas (Items)" && totalItems > 0 && (
              <span className="text-[9px] bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded-lg font-black flex items-center gap-1 border border-secondary/20">
                {Math.round((lunasItems / totalItems) * 100)}%
              </span>
            )}
          </div>
          
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-[2px] opacity-20",
            stat.color === "primary" ? "bg-primary" : 
            stat.color === "secondary" ? "bg-secondary" : 
            stat.color === "blue" ? "bg-blue-600" :
            "bg-accent"
          )} />
        </div>
      ))}
    </div>
  );
}
