"use client";

import { Layout, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/dashboard/ModeToggle";

export default function Home() {
  return (
    <div className="relative h-dvh bg-background overflow-hidden selection:bg-primary/20">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl md:text-2xl font-extrabold tracking-tighter flex items-center gap-2">
           <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-sm">
             <Layout size={20} />
           </div>
           Order<span className="text-primary">Flow</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">Sign In</Link>
          <ModeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 h-[calc(100dvh-76px)] flex flex-col items-center justify-center px-6 max-w-6xl mx-auto text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05] uppercase">
            Manage <span className="text-primary">Orders</span> <br />
            with Zero Friction.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-bold uppercase tracking-wide leading-relaxed">
            The ultimate companion for your small business. Track payments and manage inventory in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-2">
                Get Started Free <ArrowRight size={18} />
              </span>
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-muted/50 border border-border rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-muted transition-colors active:scale-[0.98]"
            >
              Live Demo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
