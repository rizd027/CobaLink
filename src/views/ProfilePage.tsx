"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { 
  Store, 
  Key, 
  LayoutGrid, 
  Database, 
  ArrowUpDown, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Loader2,
  Heart
} from "lucide-react";
import { logoutUser } from "@/services/auth";
import { cn } from "@/lib/utils";
import { PageId } from "@/components/dashboard/DashboardShell";

interface ProfileItemProps {
  icon: any;
  title: string;
  subtitle: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

function ProfileItem({ icon: Icon, title, subtitle, onClick, variant = "default" }: ProfileItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-5 py-5 px-0 hover:bg-muted/30 active:bg-muted/50 transition-colors text-left border-b border-border/60 last:border-0",
        variant === "danger" && "text-destructive"
      )}
    >
      <div className={cn(
        "flex-shrink-0 text-foreground",
        variant === "danger" && "text-destructive"
      )}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-bold tracking-tight">{title}</h3>
        <p className="text-[14px] text-muted-foreground font-medium leading-tight mt-1">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-muted-foreground/30" />
    </button>
  );
}

interface ProfilePageProps {
  onNavigate: (page: PageId) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[600px] mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {/* User Header */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-black">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{user?.email?.split('@')[0]}</h2>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-0">
          <ProfileItem 
            icon={Store} 
            title="Toko Saya" 
            subtitle="Atur informasi toko" 
            onClick={() => onNavigate("store-settings")}
          />
          <ProfileItem 
            icon={Key} 
            title="Password" 
            subtitle="Ganti kata sandi akun Anda" 
            onClick={() => onNavigate("password-settings")}
          />
          <ProfileItem 
            icon={LayoutGrid} 
            title="Preferensi" 
            subtitle="Atur PIN masuk & tampilan" 
            onClick={() => onNavigate("preferences")}
          />
          <ProfileItem 
            icon={Database} 
            title="Penyimpanan Data" 
            subtitle="Backup, Restore, & Hapus Data" 
            onClick={() => onNavigate("data-storage")}
          />
          <ProfileItem 
            icon={HelpCircle} 
            title="Bantuan" 
            subtitle="Panduan penggunaan detail" 
            onClick={() => onNavigate("help")}
          />
          <ProfileItem 
            icon={Heart} 
            title="Donasi Saweria" 
            subtitle="Dukung pengembang via Saweria" 
            onClick={() => window.open("https://saweria.co/frd027", "_blank")}
          />
          <ProfileItem 
            icon={LogOut} 
            title="Keluar" 
            subtitle="Keluar dari akun Anda" 
            variant="danger"
            onClick={handleLogout}
          />
        </div>

        {/* Version Info */}
        <div className="text-center space-y-1">
          <h4 className="text-[13px] font-black uppercase tracking-widest text-muted-foreground/60">Versi Aplikasi</h4>
          <p className="text-[12px] font-bold text-muted-foreground/40">OrderFlow v1.49.10</p>
        </div>
      </div>
    </div>
  );
}
