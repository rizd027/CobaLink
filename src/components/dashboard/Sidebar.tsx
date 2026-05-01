"use client";

import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  User, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import type { PageId } from "@/components/dashboard/DashboardShell";

interface SidebarProps {
  className?: string;
  activePage?: PageId;
  onNavigate?: (page: PageId) => void;
  /** @deprecated Legacy prop — use onNavigate instead */
  onAddClick?: () => void;
}

export function Sidebar({ className, activePage = "dashboard", onNavigate, onAddClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const menuItems: { icon: React.ElementType; label: string; page: PageId }[] = [
    { icon: LayoutDashboard, label: "DASHBOARD", page: "dashboard" },
    { icon: ShoppingCart, label: "LIST ORDERS", page: "orders" },
    { icon: FileText, label: "REPORTS", page: "reports" },
    { icon: User, label: "PROFILE", page: "profile" },
  ];

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen border-r bg-white transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[260px]",
        className
      )}
      suppressHydrationWarning
    >
      <div className="flex items-center justify-between p-6 h-[80px]" suppressHydrationWarning>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <LayoutDashboard size={18} />
            </div>
            Order Flow
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto rounded-lg"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2" suppressHydrationWarning>
        {menuItems.map((item) => {
          const isActive = activePage === item.page;
          return (
            <Button
              key={item.label}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-4 h-12 rounded-lg font-bold text-[11px] uppercase tracking-wider",
                isActive
                  ? "bg-primary text-white shadow-none"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(item.page);
                } else if (item.page === "add-order" && onAddClick) {
                  onAddClick();
                }
              }}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-2" suppressHydrationWarning>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 h-12 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-[11px] uppercase tracking-wider",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
