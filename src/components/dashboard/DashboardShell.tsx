"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useOrderStore } from "@/store/useOrderStore";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, FileText, User } from "lucide-react";

import { OrdersPage } from "@/views/OrdersPage";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { ProfilePage } from "@/views/ProfilePage";
import { OrderFormView } from "@/views/OrderFormView";
import { CategoryManagerView } from "@/views/CategoryManagerView";
import { FieldManagerView } from "@/views/FieldManagerView";
import { StoreSettingsView } from "@/views/StoreSettingsView";
import { PasswordSettingsView } from "@/views/PasswordSettingsView";
import { PreferencesView } from "@/views/PreferencesView";
import { DataStorageView } from "@/views/DataStorageView";
import { HelpView } from "@/views/HelpView";

export type PageId = "orders" | "add-order" | "edit-order" | "profile" | "categories" | "fields" | "store-settings" | "password-settings" | "preferences" | "data-storage" | "help";

export function DashboardShell() {
  const [activePage, setActivePage] = useState<PageId>("orders");
  const { 
    initData, 
    destroyData, 
    selectedOrder, 
    close, 
    setIsViewingCategories, 
    setCategoryId,
  } = useOrderStore();
  
  const isOverlayPage =
    activePage === "categories" ||
    activePage === "fields" ||
    activePage === "store-settings" ||
    activePage === "password-settings" ||
    activePage === "preferences" ||
    activePage === "data-storage" ||
    activePage === "help";

  useEffect(() => {
    initData();
    // Initialize history state
    window.history.replaceState({ page: "orders", isViewingCategories: true }, "");

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        const { page, isViewingCategories: historyIsViewing, categoryId } = event.state;
        setActivePage(page as PageId);
        
        if (page === "orders") {
          if (historyIsViewing !== undefined) {
            setIsViewingCategories(historyIsViewing);
          }
          if (categoryId !== undefined) {
            setCategoryId(categoryId);
          }
        }
        
        if (page !== "edit-order" && page !== "add-order") {
          close();
        }
      } else {
        setActivePage("orders");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      destroyData();
      window.removeEventListener("popstate", handlePopState);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = (page: PageId) => {
    if (page !== activePage) {
      if (page === "orders") {
        window.history.pushState({ page, isViewingCategories: true }, "");
        setIsViewingCategories(true);
      } else {
        window.history.pushState({ page }, "");
      }
      setActivePage(page);
    }
  };

  const handleBack = () => {
    if (window.history.state?.page === activePage) {
      window.history.back();
    } else {
      setActivePage("orders");
      close();
    }
  };

  return (
    <div className="flex h-dvh bg-background font-inter overflow-hidden" suppressHydrationWarning>
      <ConfirmDialog />
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
          "sticky top-0 z-10 bg-background/80 backdrop-blur-md",
          isOverlayPage ? "hidden" : "block"
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
          <div className={cn("h-full flex flex-col", activePage === "orders" ? "block" : "hidden")} suppressHydrationWarning>
            <OrdersPage onNavigate={handleNavigate} />
          </div>
          <div className={cn("h-full flex flex-col", activePage === "profile" ? "block" : "hidden")} suppressHydrationWarning>
            <ProfilePage onNavigate={handleNavigate} />
          </div>
          
          {/* Full Page Forms/Managers */}
          {activePage === "add-order" && (
            <div className="fixed inset-0 z-50 bg-background">
              <OrderFormView onBack={handleBack} />
            </div>
          )}
          {activePage === "edit-order" && (
            <div className="fixed inset-0 z-50 bg-background">
              <OrderFormView order={selectedOrder} onBack={handleBack} />
            </div>
          )}
          {activePage === "categories" && (
            <div className="fixed inset-0 z-50 bg-background">
              <CategoryManagerView onBack={handleBack} />
            </div>
          )}
          {activePage === "fields" && (
            <div className="fixed inset-0 z-50 bg-background">
              <FieldManagerView onBack={handleBack} />
            </div>
          )}
          {activePage === "store-settings" && (
            <div className="fixed inset-0 z-50 bg-background">
              <StoreSettingsView onBack={handleBack} />
            </div>
          )}
          {activePage === "password-settings" && (
            <div className="fixed inset-0 z-50 bg-background">
              <PasswordSettingsView onBack={handleBack} />
            </div>
          )}
          {activePage === "preferences" && (
            <div className="fixed inset-0 z-50 bg-background">
              <PreferencesView onBack={handleBack} />
            </div>
          )}
          {activePage === "data-storage" && (
            <div className="fixed inset-0 z-50 bg-background">
              <DataStorageView onBack={handleBack} />
            </div>
          )}
          {activePage === "help" && (
            <div className="fixed inset-0 z-50 bg-background">
              <HelpView onBack={handleBack} />
            </div>
          )}
        </main>

        {!isOverlayPage && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-2.5 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: "orders" as const, label: "Orders", icon: ShoppingCart },
                { id: "profile" as const, label: "Profile", icon: User },
              ].map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary scale-105" 
                        : "text-muted-foreground hover:text-foreground",
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
