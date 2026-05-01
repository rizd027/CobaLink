"use client";

import { Layout } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex h-dvh w-full items-center justify-center bg-background px-4 overflow-hidden"
      suppressHydrationWarning
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-6xl h-full flex flex-col items-center justify-center gap-5 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform">
           <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
             <Layout size={22} />
           </div>
           Order<span className="text-primary">Flow</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
