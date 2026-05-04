import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  Smartphone,
  Sparkles,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DecisionBadge, RiskGauge } from "@/components/RiskVisuals";
import type { RiskResult } from "@/lib/risk-engine";
import {
  simulateNacRisk,
  type ActionType,
  type NacSimulatorConfig,
} from "@/lib/api";

export const Route = createFileRoute("/app/simulator")({
  head: () => ({ meta: [{ title: "Simulator - TrustGuard AI" }] }),
  component: Simulator,
});

const actions: Array<{
  id: ActionType;
  label: string;
  icon: typeof Smartphone;
  desc: string;
}> = [
  {
    id: "login",
    label: "Login",
    icon: Smartphone,
    desc: "Account access attempt",
  },
  { id: "send", label: "Send Money", icon: Send, desc: "P2P transfer R12,400" },
  { id: "withdraw", label: "Withdraw", icon: Wallet, desc: "Cash-out R50,000" },
  {
    id: "loan",
    label: "Apply Loan",
    icon: FileText,
    desc: "Microloan R25,000",
  },
];

const actionAmounts: Record<ActionType, number> = {
  login: 0,
  send: 12400,
  withdraw: 50000,
  loan: 25000,
};

const nacFlow = ["SIM Swap", "KYC Match", "Location Verification"];

function Simulator() {
  const [phone, setPhone] = useState("+3672123456");
  const [action, setAction] = useState<ActionType>("withdraw");
  const [nac, setNac] = useState<NacSimulatorConfig>({
    rapidApiKey: "",
    customerName: "Federica Sanchez Arjona",
    idDocument: "66666666q",
    latitude: 47,
    longitude: 19,
    radiusMeters: 10000,
    simSwapMaxAgeHours: 72,
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const missingNacFields = getMissingNacFields(nac);

  async function runCheck() {
    if (missingNacFields.length) {
      setResult(null);
      setError(
        `Nokia NaC API information is required before risk analysis can run. Missing: ${missingNacFields.join(", ")}.`,
      );
      return;
    }

    setRunning(true);
    setResult(null);
    setError(null);
    setStep(0);

    for (let i = 1; i <= nacFlow.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setStep(i);
    }

    try {
      const response = await simulateNacRisk({
        phone,
        action,
        amount: actionAmounts[action],
        nac,
      });
      setResult(response);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "The NaC simulator request failed.";
      console.warn("Nokia NaC simulator request failed.", caught);
      setError(message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <AppShell
      title="Transaction Simulator"
      subtitle="Run a transaction through Nokia Network as Code signals and TrustGuard decisioning"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              Simulator device
            </div>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Free NaC simulator identifiers use +3672, +3670, 3637, or
              device@testcsp.net.
            </p>

            <div className="mb-3 mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              Transaction
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAction(item.id)}
                  className={`rounded-xl border p-3 text-left transition-base ${
                    action === item.id
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <item.icon
                    className={`mb-2 h-4 w-4 ${
                      action === item.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Amount
              </span>
              <span className="font-mono text-sm font-semibold">
                R{actionAmounts[action].toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
              Nokia NaC simulator
            </div>
            <div className="space-y-3">
              <TextField
                label="NaC application key"
                type="password"
                value={nac.rapidApiKey}
                onChange={(value) =>
                  setNac((current) => ({ ...current, rapidApiKey: value }))
                }
              />
              <TextField
                label="Customer name"
                value={nac.customerName ?? ""}
                onChange={(value) =>
                  setNac((current) => ({ ...current, customerName: value }))
                }
              />
              <TextField
                label="ID document"
                value={nac.idDocument ?? ""}
                onChange={(value) =>
                  setNac((current) => ({ ...current, idDocument: value }))
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <TextField
                  label="Latitude"
                  type="number"
                  value={String(nac.latitude ?? "")}
                  onChange={(value) =>
                    setNac((current) => ({
                      ...current,
                      latitude: value === "" ? undefined : Number(value),
                    }))
                  }
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={String(nac.longitude ?? "")}
                  onChange={(value) =>
                    setNac((current) => ({
                      ...current,
                      longitude: value === "" ? undefined : Number(value),
                    }))
                  }
                />
                <TextField
                  label="Radius"
                  type="number"
                  value={String(nac.radiusMeters ?? 2000)}
                  onChange={(value) =>
                    setNac((current) => ({
                      ...current,
                      radiusMeters: value === "" ? undefined : Number(value),
                    }))
                  }
                />
              </div>
              <TextField
                label="SIM swap window (hours)"
                type="number"
                value={String(nac.simSwapMaxAgeHours ?? 72)}
                onChange={(value) =>
                  setNac((current) => ({
                    ...current,
                    simSwapMaxAgeHours:
                      value === "" ? undefined : Number(value),
                  }))
                }
              />
              {missingNacFields.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                  Required before analysis: {missingNacFields.join(", ")}.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={runCheck}
            disabled={running}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-elegant transition-spring hover:shadow-glow disabled:opacity-60"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Calling Nokia NaC
                APIs...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Run trust check
              </>
            )}
          </button>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
            {result?.decision === "block" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-danger opacity-[0.04]" />
            )}

            <AnimatePresence mode="wait">
              {!result && !running && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                >
                  <Sparkles className="mb-3 h-10 w-10 text-primary/40" />
                  <p className="text-sm">
                    Enter the NaC simulator details and run a trust check.
                  </p>
                </motion.div>
              )}

              {running && (
                <motion.div
                  key="running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8"
                >
                  <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                    Orchestrating Nokia NaC APIs
                  </div>
                  <div className="space-y-2.5">
                    {nacFlow.map((api, index) => (
                      <div key={api} className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-base ${
                            step > index
                              ? "bg-success text-success-foreground"
                              : step === index
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step > index ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : step === index ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="text-[10px]">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            step >= index
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          Nokia NaC - {api}
                        </span>
                        {step > index && (
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                            {80 + index * 20}ms
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {error && !running && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid items-center gap-6 md:grid-cols-2"
                >
                  <div className="flex flex-col items-center">
                    <RiskGauge score={result.score} />
                    <div className="mt-4">
                      <DecisionBadge decision={result.decision} size="lg" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary">
                      <Sparkles className="h-3 w-3" /> AI explanation
                    </div>
                    <p className="text-sm leading-relaxed">
                      {result.explanation}
                    </p>

                    <div className="mt-5 space-y-1.5">
                      {result.factors
                        .filter((factor) => factor.impact > 0)
                        .map((factor) => (
                          <div
                            key={factor.label}
                            className="flex items-center justify-between rounded-lg bg-muted p-2 text-xs"
                          >
                            <span className="flex items-center gap-2">
                              {factor.status === "bad" ? (
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />
                              )}
                              {factor.label}
                            </span>
                            <span className="font-mono font-semibold">
                              +{factor.impact}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="mb-1 font-display font-semibold">
                API orchestration
              </h3>
              <p className="mb-5 text-xs text-muted-foreground">
                Backend decision from official Nokia Network as Code simulator
                signals
              </p>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <FlowNode label="Request" sub={action} status="ok" />
                <Connector />
                <div className="flex flex-1 flex-col gap-2">
                  {result.apisCalled.map((api) => (
                    <div key={api.name} className="flex items-center gap-2">
                      <Connector small />
                      <div
                        className={`flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border p-2.5 ${
                          api.status === "bad"
                            ? "border-destructive/30 bg-destructive/5"
                            : api.status === "warn"
                              ? "border-warning/30 bg-warning/5"
                              : "border-success/30 bg-success/5"
                        }`}
                      >
                        <span className="min-w-0 truncate text-xs font-medium">
                          {api.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {api.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Connector />
                <FlowNode
                  label="Decision"
                  sub={result.decision.replace("_", " ")}
                  status={
                    result.decision === "approve"
                      ? "ok"
                      : result.decision === "block"
                        ? "bad"
                        : "warn"
                  }
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FlowNode({
  label,
  sub,
  status,
}: {
  label: string;
  sub: string;
  status: "ok" | "warn" | "bad";
}) {
  const cls =
    status === "bad"
      ? "bg-destructive/10 border-destructive/30 text-destructive"
      : status === "warn"
        ? "bg-warning/15 border-warning/30 text-warning-foreground"
        : "bg-primary/10 border-primary/30 text-primary";

  return (
    <div className={`min-w-[100px] rounded-xl border p-3 text-center ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold capitalize">{sub}</div>
    </div>
  );
}

function Connector({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`hidden h-px bg-gradient-to-r from-border via-primary/40 to-border md:block ${
        small ? "w-4" : "w-6"
      }`}
    />
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "number";
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function getMissingNacFields(nac: NacSimulatorConfig): string[] {
  const missing = [];
  if (!nac.rapidApiKey.trim()) missing.push("NaC application key");
  if (!(nac.customerName ?? "").trim()) missing.push("Customer name");
  if (nac.latitude === undefined) missing.push("Latitude");
  if (nac.longitude === undefined) missing.push("Longitude");
  return missing;
}
