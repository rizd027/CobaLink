"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Loader2, User, Mail, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/services/auth";

export function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setUser(data.user);
      setIsLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    // Redirect outside dashboard to login page
    window.location.href = "/login";
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 max-w-[1000px] mx-auto">
      <header 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-5 bg-card p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-border shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <User size={18} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">Account Settings</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Manage your personal information</p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
           <div className="md:col-span-1 space-y-4">
              <div className="p-5 sm:p-7 rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-extrabold shadow-sm mb-4 sm:mb-5">
                    {user?.email?.[0].toUpperCase()}
                 </div>
                 <h3 className="text-lg sm:text-xl font-bold">{user?.email?.split('@')[0]}</h3>
                 <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Administrator</p>
              </div>
           </div>

           <div className="md:col-span-2 space-y-4">
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border shadow-sm space-y-6">
                 <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Email Address</h4>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                       <Mail size={16} className="text-muted-foreground" />
                       <span className="font-semibold text-xs sm:text-sm">{user?.email}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Security Role</h4>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                       <Shield size={16} className="text-muted-foreground" />
                       <span className="font-semibold text-xs sm:text-sm">Full Access Administrator</span>
                    </div>
                 </div>

                 <div className="pt-5 border-t border-border">
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      className="h-10 rounded-lg px-6 font-semibold text-xs sm:text-sm"
                    >
                       <LogOut size={16} className="mr-2" /> Sign Out
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
