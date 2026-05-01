import { OrderTable } from "@/components/dashboard/OrderTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Analytics } from "@/components/dashboard/Analytics";
import { useOrderStore } from "@/store/useOrderStore";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardOverview() {
  const { orders, isOrdersLoading, openAdd, openEdit } = useOrderStore();

  return (
    <div
      className="h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 lg:p-8 xl:p-10 space-y-5 lg:space-y-7 max-w-[1600px] mx-auto"
      suppressHydrationWarning
    >
      {/* Header Section - Simplified */}
      <header 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-6"
        suppressHydrationWarning
      >
        <div className="space-y-1.5 max-w-2xl" suppressHydrationWarning>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <div className="h-1.5 w-7 bg-primary rounded-full" suppressHydrationWarning />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-[44px] font-black tracking-tight text-foreground leading-[0.95]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Global monitoring of your business performance and recent activity.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto" suppressHydrationWarning>
          <Button 
            onClick={openAdd}
            className="h-9 w-full sm:w-auto rounded-lg bg-primary text-primary-foreground shadow-sm font-black text-[10px] uppercase tracking-wider px-4 sm:px-6"
          >
            <Plus size={16} className="mr-2" />
            Quick Order
          </Button>
        </div>
      </header>

      {isOrdersLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <Loader2 className="animate-spin text-primary/40" size={32} />
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing data...</p>
        </div>
      ) : (
        <div 
          className="space-y-6 lg:space-y-7"
          suppressHydrationWarning
        >
          <StatsCards orders={orders} />
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            <section className="xl:col-span-9 rounded-xl border border-border/60 bg-card/50 p-3 sm:p-4 shadow-sm space-y-3 flex flex-col xl:h-[clamp(320px,42dvh,460px)]">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground">Recent Orders</h3>
                 </div>
                 <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Latest 5 activities</p>
              </div>
              <div className="flex-1 min-h-0">
                <OrderTable orders={orders.slice(0, 5)} onEdit={openEdit} embedded />
              </div>
            </section>

            <section className="xl:col-span-3 rounded-xl border border-border/60 bg-card/50 p-3 sm:p-4 shadow-sm flex xl:h-[clamp(320px,42dvh,460px)]">
              <Analytics orders={orders} className="h-full w-full" />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
