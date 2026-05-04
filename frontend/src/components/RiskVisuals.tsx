import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import type { Decision } from "@/lib/risk-engine";

export function DecisionBadge({
  decision,
  size = "md",
}: {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}) {
  const map = {
    approve: {
      label: "Approved",
      icon: CheckCircle2,
      cls: "bg-success/10 text-success border-success/20",
    },
    step_up: {
      label: "Step-up",
      icon: AlertTriangle,
      cls: "bg-warning/15 text-warning-foreground border-warning/30",
    },
    block: {
      label: "Blocked",
      icon: ShieldX,
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    },
  } as const;
  const v = map[decision];
  const Icon = v.icon;
  const padding =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "sm"
        ? "px-2 py-0.5 text-[10px]"
        : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${v.cls} ${padding}`}
    >
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {v.label}
    </span>
  );
}

export function RiskGauge({ score }: { score: number }) {
  const color =
    score >= 60
      ? "var(--destructive)"
      : score >= 30
        ? "var(--warning)"
        : "var(--success)";
  const label = score >= 60 ? "High Risk" : score >= 30 ? "Medium" : "Low Risk";
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="var(--muted)"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeDasharray={circumference}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-display font-bold tabular-nums"
        >
          {score}
        </motion.div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
