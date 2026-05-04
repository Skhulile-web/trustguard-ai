import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { calculateRiskScore } from "@/lib/risk-engine";
import {
  getTransactions,
  transactionsStreamUrl,
  type TransactionEvent,
} from "@/lib/api";

export const Route = createFileRoute("/app/timeline")({
  head: () => ({ meta: [{ title: "Trust Timeline - TrustGuard AI" }] }),
  component: TimelinePage,
});

const ACTIONS = ["login", "send", "withdraw", "loan"] as const;

function fakeEvent(): TransactionEvent {
  const result = calculateRiskScore({
    simSwap: Math.random() < 0.18,
    deviceChanged: Math.random() < 0.3,
    kycMatch: Math.random() > 0.06,
    locationMismatch: Math.random() < 0.12,
    numberVerified: Math.random() > 0.03,
    velocityAnomaly: Math.random() < 0.15,
  });

  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    phone: `+88017${Math.floor(10000000 + Math.random() * 89999999)}`,
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    amount: [1200, 5400, 12400, 25000, 50000][Math.floor(Math.random() * 5)],
    score: result.score,
    decision: result.decision,
    timestamp: new Date().toISOString(),
  };
}

function TimelinePage() {
  const [events, setEvents] = useState<TransactionEvent[]>(() =>
    Array.from({ length: 8 }, fakeEvent),
  );
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    const stream = new EventSource(transactionsStreamUrl());

    getTransactions(40)
      .then((transactions) => {
        if (!cancelled && transactions.length) {
          setEvents(transactions);
        }
      })
      .catch((error) => {
        console.warn("Backend transactions fetch failed.", error);
      });

    stream.onopen = () => {
      if (!cancelled) {
        setConnected(true);
      }
    };

    stream.onmessage = (message) => {
      const event = JSON.parse(message.data) as TransactionEvent;
      setEvents((cur) => [event, ...cur].slice(0, 40));
    };

    stream.onerror = (error) => {
      console.warn(
        "Backend transaction stream failed, using local fallback.",
        error,
      );
      setConnected(false);
      stream.close();
      fallbackTimer ??= setInterval(() => {
        setEvents((cur) => [fakeEvent(), ...cur].slice(0, 40));
      }, 2200);
    };

    return () => {
      cancelled = true;
      stream.close();
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, []);

  return (
    <AppShell
      title="Trust Timeline"
      subtitle="Live stream of fraud decisions across the network"
    >
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success pulse-ring" />
            </div>
            <span className="text-sm font-medium">
              Live -{" "}
              {connected ? "streaming from API Gateway" : "local fallback"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {events.length} events
          </span>
        </div>
        <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
          <AnimatePresence initial={false}>
            {events.map((event) => {
              const tone =
                event.decision === "block"
                  ? {
                      icon: ShieldX,
                      bg: "bg-destructive/10",
                      fg: "text-destructive",
                      label: "Block",
                    }
                  : event.decision === "step_up"
                    ? {
                        icon: ShieldAlert,
                        bg: "bg-warning/10",
                        fg: "text-warning",
                        label: "Step-up",
                      }
                    : {
                        icon: ShieldCheck,
                        bg: "bg-success/10",
                        fg: "text-success",
                        label: "Approve",
                      };
              const Icon = tone.icon;

              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-6 py-3 flex items-center gap-4 hover:bg-muted/30 transition-base"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${tone.bg} ${tone.fg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono">{event.phone}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="capitalize">{event.action}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="font-mono text-xs">
                        R{event.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${tone.fg}`}>
                      {tone.label}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      score {event.score}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </AppShell>
  );
}
