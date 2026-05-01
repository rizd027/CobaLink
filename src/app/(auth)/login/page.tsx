"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power3.out"
    });
  }, { scope: containerRef });

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
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-[430px] p-6 md:p-7 rounded-2xl glass border border-white/15 shadow-2xl space-y-6"
    >
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl md:text-[2rem] font-extrabold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium">Enter your credentials to access your dashboard</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} method="POST" action="#" className="space-y-4.5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
               <FormItem>
                 <FormLabel className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                   <Mail size={14} /> Email Address
                 </FormLabel>
                 <FormControl>
                   <Input placeholder="name@example.com" {...field} className="h-11 rounded-lg bg-muted/30 border-none focus-visible:ring-primary/20 font-medium" />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: any }) => (
               <FormItem>
                 <FormLabel className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                   <Lock size={14} /> Password
                 </FormLabel>
                 <FormControl>
                   <Input type="password" placeholder="••••••••" {...field} className="h-11 rounded-lg bg-muted/30 border-none focus-visible:ring-primary/20 font-medium" />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <Button className="w-full h-12 rounded-lg font-semibold text-base shadow-xl hover:shadow-primary/20 transition-all active:scale-95 group" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
               <span className="flex items-center gap-2">
                 Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </span>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-1">
        <p className="text-sm text-muted-foreground font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
