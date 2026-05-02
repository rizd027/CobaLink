"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { registerUser } from "@/services/auth";

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      await registerUser(values.email, values.password);
      toast.success("Account created! Please verify your email.");
      router.push("/verify-email");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[430px] p-6 md:p-8 rounded-2xl bg-card border border-border shadow-xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Create Account</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
          Join OrderFlow and start managing orders
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Lock size={14} /> Confirm Password
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
                Create Account <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
