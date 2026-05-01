"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) {
        Cookies.set("auth-token", session.access_token, { expires: 1 });
      } else {
        Cookies.remove("auth-token");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      
      if (session) {
        Cookies.set("auth-token", session.access_token, { expires: 1 });
        
        // Redirect logic based on email verification
        const isEmailVerified = !!user?.email_confirmed_at;
        if (!isEmailVerified && pathname === "/dashboard") {
          router.push("/verify-email");
        }
      } else {
        Cookies.remove("auth-token");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, router, pathname]);

  return <>{children}</>;
}
