"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { resendVerificationEmail, logoutUser } from "@/services/auth";
import { supabase } from "@/services/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!user?.email) return;
    setIsResending(true);
    try {
      await resendVerificationEmail(user.email);
      toast.success("Verification email resent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (updatedUser?.email_confirmed_at) {
        toast.success("Email verified!");
        router.push("/dashboard");
      } else {
        toast.info("Email not verified yet. Please check your inbox.");
      }
    } catch (error: any) {
      toast.error("Failed to refresh status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <Card className="border-none shadow-xl bg-background/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Mail className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We&apos;ve sent a verification link to <strong>{user?.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-center text-muted-foreground">
          Click the link in your email to verify your account. If you don&apos;t see it, check your spam folder.
        </p>
        <Button className="w-full" onClick={checkStatus} disabled={isChecking}>
          {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          I&apos;ve verified my email
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex flex-col w-full gap-2">
          <Button variant="outline" className="w-full" onClick={handleResend} disabled={isResending}>
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Email
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            Back to Login
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
