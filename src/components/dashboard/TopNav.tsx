"use client";

import { Search, User, LogOut, Settings, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import type { PageId } from "@/components/dashboard/DashboardShell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useOrderStore } from "@/store/useOrderStore";

interface TopNavProps {
  activePage?: PageId;
  onNavigate?: (page: PageId) => void;
}

export function TopNav({ activePage, onNavigate }: TopNavProps = {}) {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery } = useOrderStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b bg-white px-3 sm:px-6 md:px-10" suppressHydrationWarning>
      <div className="flex flex-1 items-center gap-4" suppressHydrationWarning>
        <div className="relative w-full max-w-md hidden sm:block" suppressHydrationWarning>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input 
            placeholder="Search orders, names, classes..." 
            className="pl-12 h-10 bg-gray-100/80 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6" suppressHydrationWarning>
        <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground/60" suppressHydrationWarning>
          <ThemeToggle />
          <button className="relative hover:text-primary">
            <Bell size={16} className="sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full border-2 border-white" />
          </button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 p-1 rounded-lg hover:bg-gray-50 outline-none group cursor-pointer">
            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-md sm:rounded-lg bg-primary/90 flex items-center justify-center text-white font-bold shadow-sm text-xs sm:text-sm">
              {user?.email?.[0].toUpperCase()}
            </span>
            <span className="text-left hidden sm:block">
              <span className="block text-sm font-black leading-tight tracking-tight text-foreground">{user?.email?.split("@")[0]}</span>
              <span className="block text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">ADMINISTRATOR</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-1 shadow-2xl border-white/5 bg-card/95 backdrop-blur-xl">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-primary">Account</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              className="rounded-lg p-3 gap-3 cursor-pointer font-medium hover:bg-primary/5"
              onClick={() => onNavigate?.("profile")}
            >
              <User size={16} /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg p-3 gap-3 cursor-pointer font-medium hover:bg-primary/5">
              <Settings size={16} /> Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-3 gap-3 cursor-pointer font-bold text-destructive hover:bg-destructive/10">
              <LogOut size={16} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
