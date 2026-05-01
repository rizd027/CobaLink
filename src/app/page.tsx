"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ArrowRight, Layout } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero animation
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: container });

  return (
    <div
      ref={container}
      className="relative h-dvh bg-background overflow-hidden selection:bg-primary/20"
      suppressHydrationWarning
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />

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
        <div ref={heroRef} className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.05]">
            Manage <span className="text-gradient">Orders</span> <br />
            with Zero Friction.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            The ultimate companion for your small business. Track payments, manage inventory, and generate professional reports in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link 
              href="/register" 
              className="group relative px-7 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
            <Link 
              href="/login" 
              className="px-7 py-3.5 glass rounded-xl font-semibold text-base hover:bg-muted transition-all"
            >
              Live Demo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
