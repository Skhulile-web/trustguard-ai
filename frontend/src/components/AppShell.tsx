import { Link, useRouterState } from "@tanstack/react-router";
import {
  Shield,
  LayoutDashboard,
  Zap,
  Sparkles,
  Code2,
  Activity,
  Clock,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/app/simulator", label: "Simulator", icon: Zap },
  { to: "/app/timeline", label: "Trust Timeline", icon: Clock },
  { to: "/app/insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/api", label: "API Playground", icon: Code2 },
  { to: "/app/users", label: "Users", icon: Users },
];

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-[72px] hover:w-60 group transition-spring border-r border-border bg-surface/60 backdrop-blur-xl flex flex-col py-5 sticky top-0 h-screen z-30 overflow-hidden">
        <Link to="/" className="flex items-center gap-3 px-5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Shield
              className="w-5 h-5 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-base whitespace-nowrap">
            <div className="font-display font-bold text-sm leading-tight">
              TrustGuard
            </div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
              AI
            </div>
          </div>
        </Link>

        <nav className="flex-1 px-3 space-y-1">
          {nav.map((item) => {
            const active =
              path === item.to ||
              (item.to !== "/app" && path.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-base relative ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r"
                  />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-base whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-success/10">
            <div className="relative shrink-0">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-success pulse-ring" />
            </div>
            <span className="text-xs font-medium text-success opacity-0 group-hover:opacity-100 transition-base whitespace-nowrap">
              All systems operational
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-20 flex items-center px-8 justify-between">
          <div>
            <h1 className="text-lg font-display font-semibold leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {action}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs">
              <Activity className="w-3.5 h-3.5 text-success" />
              <span className="font-mono">187ms p50</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
