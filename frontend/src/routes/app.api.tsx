import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { calculateRiskScore, type RiskResult } from "@/lib/risk-engine";
import { API_BASE_URL, scoreRisk, type ActionType } from "@/lib/api";

export const Route = createFileRoute("/app/api")({
  head: () => ({ meta: [{ title: "API Playground - TrustGuard AI" }] }),
  component: ApiPlayground,
});

function ApiPlayground() {
  const [phone, setPhone] = useState("+8801712553411");
  const [actionType, setActionType] = useState<ActionType>("withdraw");
  const [response, setResponse] = useState<ApiDecisionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState<"backend" | "local" | null>(null);

  async function run() {
    setLoading(true);
    setSource(null);

    const signals = {
      simSwap: Math.random() > 0.5,
      deviceChanged: Math.random() > 0.4,
      kycMatch: Math.random() > 0.2,
      locationMismatch: Math.random() > 0.6,
      numberVerified: true,
    };

    let result: RiskResult;
    try {
      result = await scoreRisk({
        phone,
        action: actionType,
        amount: 50000,
        signals,
      });
      setSource("backend");
    } catch (error) {
      console.warn(
        "Backend API playground request failed, using local fallback.",
        error,
      );
      await new Promise((r) => setTimeout(r, 700));
      result = calculateRiskScore(signals);
      setSource("local");
    }

    setResponse({
      request_id: `req_${Math.random().toString(36).slice(2, 10)}`,
      phone,
      action: actionType,
      timestamp: new Date().toISOString(),
      ...result,
    });
    setLoading(false);
  }

  const curl = `curl -X POST ${API_BASE_URL}/api/risk/score \\
  -H "Authorization: Bearer demo" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "${phone}",
    "action": "${actionType}",
    "amount": 50000,
    "signals": {
      "simSwap": true,
      "deviceChanged": true,
      "kycMatch": true,
      "locationMismatch": false,
      "numberVerified": true
    }
  }'`;

  function copyCurl() {
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <AppShell
      title="API Playground"
      subtitle="Test trust decisions against the FastAPI backend"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary text-primary-foreground">
                  POST
                </span>
                <span className="font-mono text-xs">/api/risk/score</span>
              </div>
              <button
                onClick={copyCurl}
                className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-base"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? "Copied" : "Copy cURL"}
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="phone">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="action">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="login">login</option>
                  <option value="send">send</option>
                  <option value="withdraw">withdraw</option>
                  <option value="loan">loan</option>
                </select>
              </Field>
              <button
                onClick={run}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 shadow-elegant hover:shadow-glow transition-spring disabled:opacity-60"
              >
                <Play className="w-4 h-4" />{" "}
                {loading ? "Calling..." : "Send request"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-foreground text-background p-5 font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="text-background/60 mb-2"># cURL</div>
            <pre>{curl}</pre>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <span className="text-xs font-mono">Response</span>
            {response && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-success text-success-foreground">
                200 OK
              </span>
            )}
          </div>
          <div className="p-5">
            {!response && !loading && (
              <div className="text-sm text-muted-foreground py-12 text-center">
                Send a request to see a JSON response.
              </div>
            )}
            {loading && (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 rounded bg-muted shimmer" />
                ))}
              </div>
            )}
            {response && (
              <>
                {source && (
                  <div className="mb-3 text-[11px] font-mono text-muted-foreground">
                    Source:{" "}
                    {source === "backend"
                      ? "FastAPI backend"
                      : "local fallback"}
                  </div>
                )}
                <motion.pre
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-xs leading-relaxed overflow-x-auto"
                >
                  {JSON.stringify(response, null, 2)}
                </motion.pre>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

type ApiDecisionResponse = RiskResult & {
  request_id: string;
  phone: string;
  action: string;
  timestamp: string;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
