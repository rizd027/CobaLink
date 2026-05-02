"use client";

import { Search, User, LogOut, Settings, Bell, MoreVertical, RefreshCcw, Download, Plus, FileText, Settings2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import type { PageId } from "./DashboardShell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { useOrderStore } from "@/store/useOrderStore";
import { 
  exportCategoriesToExcel, 
  exportCategoriesToPDF, 
  exportToExcel, 
  exportToPDF 
} from "@/services/export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TopNavProps {
  activePage?: PageId;
  onNavigate?: (page: PageId) => void;
}

export function TopNav({ activePage, onNavigate }: TopNavProps = {}) {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery, categories, orders, isViewingCategories, setIsViewingCategories, selectedCategoryId, sortOrder, setSortOrder } = useOrderStore();
  const router = useRouter();

  const handleExport = (type: "excel" | "pdf") => {
    if (activePage === "orders") {
      if (isViewingCategories) {
        if (categories.length === 0) {
          toast.error("No categories to export");
          return;
        }
        if (type === "excel") exportCategoriesToExcel(categories);
        else exportCategoriesToPDF(categories);
        toast.success(`Categories exported to ${type.toUpperCase()}`);
      } else {
        if (orders.length === 0) {
          toast.error("No orders to export");
          return;
        }
        if (type === "excel") exportToExcel(orders);
        else exportToPDF(orders);
        toast.success(`Orders exported to ${type.toUpperCase()}`);
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const getPageTitle = (id?: PageId) => {
    switch (id) {
      case "orders": return "Order Management";
      case "profile": return "Account Settings";
      case "categories": return "Categories";
      case "fields": return "Custom Fields";
      case "add-order": return "Create Order";
      case "edit-order": return "Edit Order";
      default: return "Order Management";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 sm:h-16 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-3 sm:px-6 md:px-10" suppressHydrationWarning>
      <div className="flex flex-1 items-center gap-4" suppressHydrationWarning>
        {/* Mobile Title */}
        <h1 className="text-lg font-black tracking-tight text-foreground sm:hidden truncate">
          {getPageTitle(activePage)}
        </h1>

        {/* Desktop Search */}
        <div className="relative w-full max-w-md hidden sm:block" suppressHydrationWarning>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input 
            placeholder="Search orders, names, classes..." 
            className="pl-12 h-10 bg-muted/50 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6" suppressHydrationWarning>
        <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground/60" suppressHydrationWarning>
          <ThemeToggle />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-lg outline-none flex items-center justify-center transition-colors">
            <MoreVertical size={20} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-1 shadow-2xl border-border bg-card/95 backdrop-blur-xl">
             <DropdownMenuGroup>
               <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-3 py-2">
                 {getPageTitle(activePage)} Actions
               </DropdownMenuLabel>
             </DropdownMenuGroup>
             <DropdownMenuSeparator className="bg-white/5" />

             {activePage === "orders" && (
               <>
                 {isViewingCategories ? (
                   <>
                     <DropdownMenuItem 
                      onClick={() => useOrderStore.getState().openCategoryAdd()}
                      className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <Plus size={16} className="text-primary" /> Create Category
                     </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-border/50" />
                     <DropdownMenuItem 
                       onClick={() => handleExport("excel")}
                       className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <Download size={16} className="text-primary" /> Export Excel
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                       onClick={() => handleExport("pdf")}
                       className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <FileText size={16} className="text-primary" /> Export PDF
                     </DropdownMenuItem>
                   </>
                 ) : (
                   <>
                     <div className="px-3 py-2 border-b border-border/50 bg-primary/[0.02]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Urutkan Data</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button 
                            onClick={() => setSortOrder("newest")}
                            className={cn(
                              "px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                              sortOrder === "newest" 
                                ? "bg-primary text-white shadow-md shadow-primary/20" 
                                : "bg-primary/5 text-primary/60 hover:bg-primary/10"
                            )}
                          >
                            Terbaru
                          </button>
                          <button 
                            onClick={() => setSortOrder("oldest")}
                            className={cn(
                              "px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                              sortOrder === "oldest" 
                                ? "bg-primary text-white shadow-md shadow-primary/20" 
                                : "bg-primary/5 text-primary/60 hover:bg-primary/10"
                            )}
                          >
                            Terlama
                          </button>
                        </div>
                      </div>
                     <DropdownMenuItem 
                      onClick={() => onNavigate?.("add-order")}
                      className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <Plus size={16} className="text-primary" /> Add New Order
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                      onClick={() => onNavigate?.("fields")}
                      className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <Settings2 size={16} className="text-primary" /> Define Columns
                     </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-border/50" />
                     <DropdownMenuItem 
                       onClick={() => handleExport("excel")}
                       className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <Download size={16} className="text-primary" /> Export Excel
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                       onClick={() => handleExport("pdf")}
                       className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <FileText size={16} className="text-primary" /> Export PDF
                     </DropdownMenuItem>
                     <DropdownMenuSeparator className="bg-white/5" />
                     <DropdownMenuItem 
                      onClick={() => setIsViewingCategories(true)}
                      className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5"
                     >
                       <RefreshCcw size={16} className="text-primary" /> Back to Categories
                     </DropdownMenuItem>
                   </>
                 )}
               </>
             )}

             {activePage === "profile" && (
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={16} /> Logout Account
                </DropdownMenuItem>
             )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
