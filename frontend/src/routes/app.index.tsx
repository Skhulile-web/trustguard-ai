import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DecisionBadge } from "@/components/RiskVisuals";
import {
  liveActivity,
  riskTrend,
  stats,
  timelineEvents,
} from "@/lib/mock-data";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Overview · TrustGuard AI" }] }),
  component: Overview,
});

function Overview() {
  return (
    <AppShell
      title="Trust Overview"
      subtitle="Real-time intelligence across your fraud surface"
      action={
        <Link
          to="/app/simulator"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium shadow-elegant hover:shadow-glow transition-base"
        >
          <Zap className="w-3.5 h-3.5" /> New trust check
        </Link>
      }
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Decisions today"
          value={stats.decisionsToday.toLocaleString()}
          delta="+12.4%"
          icon={Shield}
        />
        <KpiCard
          label="Approve rate"
          value={`${stats.approveRate}%`}
          delta="+0.8%"
          icon={ShieldCheck}
          accent="success"
        />
        <KpiCard
          label="Block rate"
          value={`${stats.blockRate}%`}
          delta="-0.3%"
          icon={ShieldAlert}
          accent="warning"
        />
        <KpiCard
          label="Fraud prevented"
          value={stats.fraudPrevented}
          delta="+18%"
          icon={TrendingUp}
          accent="primary"
        />
      </div>

      {/* Main grid: chart + activity */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">
                Risk decision flow · 24h
              </h3>
              <p className="text-xs text-muted-foreground">
                Approved · Step-up · Blocked
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              {[
                ["Approved", "var(--success)"],
                ["Flagged", "var(--warning)"],
                ["Blocked", "var(--destructive)"],
              ].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: c }}
                  />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--success)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--success)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--warning)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--warning)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--destructive)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="var(--success)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="flagged"
                  stroke="var(--warning)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="var(--destructive)"
                  fill="url(#g3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Live activity</h3>
            <div className="flex items-center gap-1.5 text-xs text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Streaming
            </div>
          </div>
          <div className="space-y-2">
            {liveActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-base"
              >
                <div className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                  {a.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono truncate">{a.user}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {a.action}
                  </div>
                </div>
                <DecisionBadge decision={a.decision} size="sm" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Timeline */}
      <div className="rounded-2xl bg-card border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold">
              Trust Timeline · +8801712••3411
            </h3>
            <p className="text-xs text-muted-foreground">
              Identity events for the last 24 hours
            </p>
          </div>
          <Link
            to="/app/insights"
            className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
          >
            Open AI insights <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-12 h-px bg-border" />
          <div className="grid grid-cols-8 gap-2 relative">
            {timelineEvents.map((e, i) => {
              const color =
                e.severity === "danger"
                  ? "var(--destructive)"
                  : e.severity === "warn"
                    ? "var(--warning)"
                    : e.severity === "success"
                      ? "var(--success)"
                      : "var(--primary)";
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative group"
                >
                  <div className="text-[10px] font-mono text-muted-foreground text-center mb-2">
                    {e.time}
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      {e.severity === "danger" && (
                        <div
                          className="absolute inset-0 rounded-full pulse-ring"
                          style={{ background: color }}
                        />
                      )}
                      <div
                        className="w-4 h-4 rounded-full border-2 border-card relative z-10"
                        style={{
                          background: color,
                          boxShadow: `0 0 0 4px ${color}22`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl border border-border bg-surface group-hover:shadow-elegant group-hover:-translate-y-0.5 transition-spring">
                    <div className="text-[11px] font-semibold leading-tight">
                      {e.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      {e.description}
                    </div>
                    {e.riskDelta !== undefined && (
                      <div className="mt-2 flex items-center gap-1 text-[10px]">
                        <span className="text-muted-foreground">risk</span>
                        <span
                          className="font-mono font-semibold"
                          style={{ color }}
                        >
                          {e.riskDelta}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  accent?: "default" | "success" | "warning" | "primary";
}) {
  const accentMap = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning-foreground",
    primary: "text-primary",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-base overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${accentMap[accent]}`} />
      </div>
      <div className="text-2xl font-display font-bold tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-success mt-1 flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3" /> {delta} vs yesterday
      </div>
    </motion.div>
  );
}
