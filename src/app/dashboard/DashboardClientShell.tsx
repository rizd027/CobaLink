"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardClientShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <DashboardShell />;
}
