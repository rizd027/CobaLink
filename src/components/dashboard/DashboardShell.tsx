"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { useOrderStore } from "@/store/useOrderStore";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, FileText, User } from "lucide-react";
import { DashboardOverview } from "@/views/DashboardOverview";
import { OrdersPage } from "@/views/OrdersPage";
import { ReportsPage } from "@/views/ReportsPage";
import { ProfilePage } from "@/views/ProfilePage";
import { OrderFormView } from "@/views/OrderFormView";
import { CategoryManagerView } from "@/views/CategoryManagerView";
import { FieldManagerView } from "@/views/FieldManagerView";

export type PageId = "dashboard" | "orders" | "add-order" | "edit-order" | "reports" | "profile" | "categories" | "fields";

export function DashboardShell() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const { initData, destroyData, selectedOrder, close } = useOrderStore();
  const isOverlayPage =
    activePage === "add-order" ||
    activePage === "edit-order" ||
    activePage === "categories" ||
    activePage === "fields";

  useEffect(() => {
    initData();
    return () => destroyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
  };

  const handleBack = () => {
    setActivePage("orders");
    close();
  };

  return (
    <div className="flex h-dvh bg-background font-inter overflow-hidden" suppressHydrationWarning>
      {/* Sidebar — sticky, never re-mounts */}
      <div className="sticky top-0 h-dvh flex-shrink-0 z-20" suppressHydrationWarning>
        <Sidebar
          className="hidden lg:flex"
          activePage={activePage}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh relative overflow-hidden" suppressHydrationWarning>
        <div className={cn(
          "sticky top-0 z-10 bg-background/80 backdrop-blur-md transition-all duration-300",
          isOverlayPage ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )} suppressHydrationWarning>
          <TopNav activePage={activePage} onNavigate={handleNavigate} />
        </div>

        <main
          className={cn(
            "flex-1 bg-muted/10 relative overflow-hidden flex flex-col",
            !isOverlayPage && "pb-20 lg:pb-0",
          )}
          suppressHydrationWarning
        >
          <div className={cn("h-full flex flex-col", activePage === "dashboard" ? "block" : "hidden")} suppressHydrationWarning>
            <DashboardOverview />
          </div>
          <div className={cn("h-full flex flex-col", activePage === "orders" ? "block" : "hidden")} suppressHydrationWarning>
            <OrdersPage onNavigate={handleNavigate} />
          </div>
          <div className={cn("h-full flex flex-col", activePage === "reports" ? "block" : "hidden")} suppressHydrationWarning>
            <ReportsPage />
          </div>
          <div className={cn("h-full flex flex-col", activePage === "profile" ? "block" : "hidden")} suppressHydrationWarning>
            <ProfilePage />
          </div>
          
          {/* Full Page Forms/Managers */}
          {activePage === "add-order" && (
            <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-500">
              <OrderFormView onBack={handleBack} />
            </div>
          )}
          {activePage === "edit-order" && (
            <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-500">
              <OrderFormView order={selectedOrder} onBack={handleBack} />
            </div>
          )}
          {activePage === "categories" && (
            <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-500">
              <CategoryManagerView onBack={handleBack} />
            </div>
          )}
          {activePage === "fields" && (
            <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-right duration-500">
              <FieldManagerView onBack={handleBack} />
            </div>
          )}
        </main>

        {!isOverlayPage && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-2.5 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "dashboard" as const, label: "Home", icon: LayoutDashboard },
                { id: "orders" as const, label: "Orders", icon: ShoppingCart },
                { id: "reports" as const, label: "Reports", icon: FileText },
                { id: "profile" as const, label: "Profile", icon: User },
              ].map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "h-12 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
