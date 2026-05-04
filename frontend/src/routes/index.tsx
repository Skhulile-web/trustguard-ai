import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Lock,
  Globe2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "TrustGuard AI — Real-time Fraud Prevention via Telecom Intelligence",
      },
      {
        name: "description",
        content:
          "AI-powered digital trust orchestration using CAMARA telecom APIs. Make sub-second risk decisions for fintech, SMEs, and digital platforms.",
      },
      { property: "og:title", content: "TrustGuard AI" },
      {
        property: "og:description",
        content:
          "Real-time fraud prevention powered by telecom network intelligence.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Shield
                className="w-4 h-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <span className="font-display font-bold text-base">
              TrustGuard <span className="text-primary">AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-base">
              How it works
            </a>
            <a href="#why" className="hover:text-foreground transition-base">
              Why it matters
            </a>
            <a href="#stack" className="hover:text-foreground transition-base">
              CAMARA Stack
            </a>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-base"
          >
            Open dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs font-medium mb-6"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Built on CAMARA · Live on Network APIs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight"
            >
              Stop fraud before it{" "}
              <span className="gradient-text">touches your stack.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              TrustGuard AI fuses telecom network signals — SIM swap, device,
              KYC, location — with an explainable AI engine to deliver real-time
              trust decisions in under 200&nbsp;ms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/app/simulator"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-elegant hover:shadow-glow transition-spring"
              >
                <Zap className="w-4 h-4" />
                Run a Trust Check
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-base" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card hover:bg-muted font-medium transition-base"
              >
                See live dashboard
              </Link>
            </motion.div>

            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              {["Sub-200ms decisions", "Explainable AI", "CAMARA-native"].map(
                (t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {t}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative glass rounded-3xl p-6 shadow-floating">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  <span>LIVE DECISION · 14:18:42</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold tracking-wide">
                  BLOCKED
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                Withdrawal request
              </div>
              <div className="text-3xl font-display font-bold mt-1">
                R 50,000
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +8801712••3411 · iPhone 15
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { l: "SIM Swap", v: "2h ago", bad: true },
                  { l: "Device", v: "New", bad: true },
                  { l: "KYC", v: "Match", bad: false },
                ].map((s) => (
                  <div
                    key={s.l}
                    className={`p-3 rounded-xl border ${s.bad ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5"}`}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {s.l}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${s.bad ? "text-destructive" : "text-success"}`}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-foreground/[0.03] border border-border">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
                  <Sparkles className="w-3 h-3" /> AI Explanation
                </div>
                <p className="text-sm leading-relaxed">
                  Blocked because a <b>SIM swap</b> occurred 2 hours ago and the
                  request originates from a <b>new device</b> in a different
                  city.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Risk score</span>
                <span className="font-mono font-bold text-destructive text-base">
                  92 / 100
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "187ms", l: "Avg decision latency" },
            { v: "98.4%", l: "Fraud detection rate" },
            { v: "R4.8 Cr", l: "Fraud prevented today" },
            { v: "5+", l: "CAMARA APIs orchestrated" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl font-display font-bold gradient-text">
                {s.v}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Four signals. One decision. Zero friction.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Activity,
              title: "1. Capture intent",
              desc: "User initiates a login, transfer, or loan. TrustGuard intercepts the action.",
            },
            {
              icon: Globe2,
              title: "2. Orchestrate CAMARA",
              desc: "We fan out to SIM Swap, Device, KYC, and Location APIs in parallel.",
            },
            {
              icon: Sparkles,
              title: "3. Decide & explain",
              desc: "AI scores the request and returns Approve / Step-up / Block with reasoning.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-base group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-gradient-primary group-hover:shadow-glow transition-base">
                <c.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-base" />
              </div>
              <h3 className="font-display font-semibold text-lg">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {c.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16 text-primary-foreground shadow-floating">
          <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
          <div className="relative max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Trust, decided in milliseconds.
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Open the live demo and walk a real user through a SIM swap fraud
              attempt.
            </p>
            <Link
              to="/app/simulator"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-background text-foreground font-medium hover:scale-105 transition-spring"
            >
              Launch interactive demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Lock
            className="absolute -right-10 -bottom-10 w-64 h-64 text-primary-foreground/10"
            strokeWidth={1}
          />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 TrustGuard AI — Hackathon prototype</span>
          <span className="font-mono">v0.1 · CAMARA-ready</span>
        </div>
      </footer>
    </div>
  );
}
