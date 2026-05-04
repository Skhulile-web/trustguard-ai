// TrustGuard AI — Risk Engine (simulated)
// TODO: Replace with real AI/ML model + HuggingFace LLM integration

export type RiskSignals = {
  simSwap: boolean;
  deviceChanged: boolean;
  kycMatch: boolean;
  locationMismatch: boolean;
  numberVerified?: boolean;
  velocityAnomaly?: boolean;
};

export type Decision = "approve" | "step_up" | "block";

export type RiskResult = {
  score: number;
  decision: Decision;
  explanation: string;
  factors: { label: string; impact: number; status: "ok" | "warn" | "bad" }[];
  apisCalled: {
    name: string;
    status: "ok" | "warn" | "bad";
    latencyMs: number;
  }[];
};

export function decisionFromScore(score: number): Decision {
  if (score >= 60) return "block";
  if (score >= 30) return "step_up";
  return "approve";
}

export function calculateRiskScore(s: RiskSignals): RiskResult {
  let score = 0;

  const factors: RiskResult["factors"] = [];
  if (s.simSwap) {
    score += 45;
    factors.push({
      label: "Recent SIM swap detected",
      impact: 45,
      status: "bad",
    });
  } else factors.push({ label: "No recent SIM swap", impact: 0, status: "ok" });

  if (s.deviceChanged) {
    score += 20;
    factors.push({ label: "New / unknown device", impact: 20, status: "warn" });
  } else
    factors.push({
      label: "Trusted device fingerprint",
      impact: 0,
      status: "ok",
    });

  if (!s.kycMatch) {
    score += 25;
    factors.push({ label: "KYC name mismatch", impact: 25, status: "bad" });
  } else
    factors.push({ label: "KYC identity matched", impact: 0, status: "ok" });

  if (s.locationMismatch) {
    score += 15;
    factors.push({
      label: "Location anomaly vs SIM country",
      impact: 15,
      status: "warn",
    });
  } else
    factors.push({ label: "Location consistent", impact: 0, status: "ok" });

  if (s.velocityAnomaly) {
    score += 12;
    factors.push({
      label: "High transaction velocity",
      impact: 12,
      status: "warn",
    });
  }

  score = Math.min(100, score);

  const decision = decisionFromScore(score);

  const apisCalled: RiskResult["apisCalled"] = [
    {
      name: "CAMARA Number Verification",
      status: s.numberVerified === false ? "bad" : "ok",
      latencyMs: 84,
    },
    {
      name: "CAMARA SIM Swap",
      status: s.simSwap ? "bad" : "ok",
      latencyMs: 132,
    },
    {
      name: "CAMARA Device Status",
      status: s.deviceChanged ? "warn" : "ok",
      latencyMs: 96,
    },
    {
      name: "CAMARA KYC Match",
      status: s.kycMatch ? "ok" : "bad",
      latencyMs: 178,
    },
    {
      name: "CAMARA Location Verify",
      status: s.locationMismatch ? "warn" : "ok",
      latencyMs: 112,
    },
  ];

  const reasons: string[] = [];
  if (s.simSwap) reasons.push("a SIM swap occurred within the last 24 hours");
  if (s.deviceChanged) reasons.push("the request originates from a new device");
  if (!s.kycMatch) reasons.push("KYC name does not match the SIM owner");
  if (s.locationMismatch)
    reasons.push("the geolocation is inconsistent with the SIM country");
  if (s.velocityAnomaly)
    reasons.push("transaction velocity exceeds the user's baseline");

  let explanation =
    "All signals look normal. The user's identity, device and SIM status are consistent.";
  if (reasons.length) {
    const action =
      decision === "block" ? "blocked" : "flagged for step-up verification";
    explanation = `This request was ${action} because ${reasons.join(", ")}.`;
  }

  return { score, decision, explanation, factors, apisCalled };
}

// TODO: Integrate CAMARA SIM Swap API here
// TODO: Connect to Nokia Network as Code
// TODO: Replace with real KYC Match API
// TODO: Plug in HuggingFace / Open Source LLM here
export async function simulateApiCall(
  phone: string,
  signals: RiskSignals,
): Promise<RiskResult> {
  await new Promise((r) => setTimeout(r, 600));
  return calculateRiskScore(signals);
}
