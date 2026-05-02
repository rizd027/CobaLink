"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { AUTH_LANDING_PATH, AUTH_PROTECTED_PREFIX } from "@/lib/authPaths";

const AUTH_COOKIE = "sb-access-token";

function syncAuthCookie(accessToken: string | null) {
  if (accessToken) {
    Cookies.set(AUTH_COOKIE, accessToken, {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    Cookies.remove(AUTH_COOKIE, { path: "/" });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Single source of truth for auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const path = window.location.pathname;

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setUser(session.user);
          syncAuthCookie(session.access_token);
        } else {
          setUser(null);
          // Don't clear cookie here, let the explicit SIGNED_OUT handle it
          // This prevents clearing a valid cookie set by loginUser before Supabase syncs
        }
        setLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        syncAuthCookie(null);
        // Only redirect to login if we are actually on a protected page
        if (typeof window !== "undefined" && window.location.pathname.startsWith(AUTH_PROTECTED_PREFIX)) {
          window.location.replace("/login");
        }
        setLoading(false);
        return;
      }

      setLoading(false);
    });

    // Handle initial redirect for static export
    const checkRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const pathname = window.location.pathname;

      if (pathname.startsWith(AUTH_PROTECTED_PREFIX)) {
        if (!session) {
          window.location.replace("/login");
        }
      } else if (session && (pathname === "/login" || pathname === "/register")) {
        window.location.replace(AUTH_LANDING_PATH);
      }
    };

    checkRedirect();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
