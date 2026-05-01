// All layout logic is now handled inside DashboardShell.
// This layout wraps sub-routes that still exist (e.g. redirect pages).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
