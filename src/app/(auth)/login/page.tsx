"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/services/auth";
import { AUTH_LANDING_PATH } from "@/lib/authPaths";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await loginUser(values.email, values.password);
      toast.success("Welcome back!");
      // Full navigation so middleware always sees `auth-token`
      window.location.assign(AUTH_LANDING_PATH);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[430px] p-6 md:p-8 rounded-2xl bg-card border border-border shadow-xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Welcome Back</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
          Enter your credentials to manage orders
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
               <FormItem>
                 <FormLabel className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                   <Mail size={14} /> Email Address
                 </FormLabel>
                 <FormControl>
                   <Input 
                    type="email"
                    placeholder="name@example.com" 
                    {...field} 
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-2 focus:ring-primary/20 font-bold" 
                   />
                 </FormControl>
                 <FormMessage className="text-[10px] font-bold uppercase" />
               </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
               <FormItem>
                 <FormLabel className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                   <Lock size={14} /> Password
                 </FormLabel>
                 <FormControl>
                   <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-2 focus:ring-primary/20 font-bold" 
                   />
                 </FormControl>
                 <FormMessage className="text-[10px] font-bold uppercase" />
               </FormItem>
            )}
          />
          <Button 
            className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-[0.98]" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
               <span className="flex items-center gap-2">
                 Sign In <ArrowRight size={18} />
               </span>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
