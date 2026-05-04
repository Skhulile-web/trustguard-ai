import {
  decisionFromScore,
  type Decision,
  type RiskResult,
  type RiskSignals,
} from "./risk-engine";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";
const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? "demo";

type BackendStatus = "good" | "ok" | "warn" | "bad";

type BackendRiskResult = Omit<RiskResult, "factors" | "apisCalled"> & {
  timestamp?: string;
  factors: Array<{
    label: string;
    impact: number;
    status: BackendStatus;
  }>;
  apisCalled: Array<{
    name: string;
    latencyMs: number;
    status: BackendStatus;
  }>;
};

export type ActionType = "login" | "send" | "withdraw" | "loan";

export type RiskRequest = {
  phone: string;
  action: ActionType;
  amount?: number;
  signals: RiskSignals;
};

export type NacSimulatorConfig = {
  rapidApiKey: string;
  customerName?: string;
  idDocument?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  simSwapMaxAgeHours?: number;
};

export type NacRiskRequest = Omit<RiskRequest, "signals"> & {
  nac: NacSimulatorConfig;
  signals?: RiskSignals;
};

export type TransactionEvent = {
  id: string;
  phone: string;
  action: ActionType;
  amount: number;
  score: number;
  decision: Decision;
  timestamp: string;
};

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  tier: string;
  devices: number;
  trust?: number;
  lastSeen?: string;
};

export type Insight = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  summary: string;
  detail?: string;
  factors: string[];
};

function headers() {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...headers(),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach the FastAPI backend at ${API_BASE_URL}. Confirm the backend is running and refresh the page.`,
      );
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await errorMessage(response)}`);
  }

  return response.json() as Promise<T>;
}

async function errorMessage(response: Response): Promise<string> {
  const body = await response.text();
  if (!body) return response.statusText;

  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail)) return parsed.detail.join(", ");
  } catch {
    // Fall through to the raw body below.
  }

  return body;
}

function normalizeStatus(status: BackendStatus): "ok" | "warn" | "bad" {
  return status === "good" ? "ok" : status;
}

function normalizeRiskResult(result: BackendRiskResult): RiskResult {
  const decision = decisionFromScore(result.score);

  return {
    score: result.score,
    decision,
    explanation: result.explanation,
    factors: result.factors.map((factor) => ({
      ...factor,
      status: normalizeStatus(factor.status),
    })),
    apisCalled: result.apisCalled.map((api) => ({
      ...api,
      status: normalizeStatus(api.status),
    })),
  };
}

export async function scoreRisk(payload: RiskRequest): Promise<RiskResult> {
  const result = await request<BackendRiskResult>("/api/risk/score", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeRiskResult(result);
}

export async function simulateRisk(payload: RiskRequest): Promise<RiskResult> {
  const result = await request<BackendRiskResult>("/api/risk/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeRiskResult(result);
}

export async function simulateNacRisk(
  payload: NacRiskRequest,
): Promise<RiskResult> {
  const result = await request<BackendRiskResult>("/api/risk/nac-simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeRiskResult(result);
}

export function transactionsStreamUrl(): string {
  return `${API_BASE_URL}/api/transactions/stream`;
}

export async function getTransactions(limit = 50): Promise<TransactionEvent[]> {
  return request<TransactionEvent[]>(`/api/transactions?limit=${limit}`);
}

export async function getUsers(): Promise<UserProfile[]> {
  return request<UserProfile[]>("/api/users");
}

export async function getInsights(): Promise<Insight[]> {
  return request<Insight[]>("/api/insights");
}

export { API_BASE_URL };
