export type TimelineEvent = {
  id: string;
  time: string;
  type: "sim" | "device" | "location" | "risk" | "login" | "txn";
  title: string;
  description: string;
  severity: "info" | "warn" | "danger" | "success";
  riskDelta?: number;
};

export const timelineEvents: TimelineEvent[] = [
  {
    id: "1",
    time: "09:12",
    type: "login",
    title: "Login from Dhaka",
    description: "Trusted device · Banglalink SIM",
    severity: "success",
    riskDelta: 4,
  },
  {
    id: "2",
    time: "10:45",
    type: "txn",
    title: "Mobile top-up · R500",
    description: "Device fingerprint match",
    severity: "info",
    riskDelta: 6,
  },
  {
    id: "3",
    time: "13:22",
    type: "device",
    title: "New device pairing",
    description: "iPhone 15 · iOS 18.2 · first seen",
    severity: "warn",
    riskDelta: 28,
  },
  {
    id: "4",
    time: "14:01",
    type: "location",
    title: "Location jump detected",
    description: "Dhaka → Chittagong in 41 min",
    severity: "warn",
    riskDelta: 41,
  },
  {
    id: "5",
    time: "14:18",
    type: "sim",
    title: "SIM swap event",
    description: "CAMARA reports swap 2h ago",
    severity: "danger",
    riskDelta: 78,
  },
  {
    id: "6",
    time: "14:20",
    type: "risk",
    title: "Withdrawal blocked",
    description: "R50,000 transfer rejected by TrustGuard",
    severity: "danger",
    riskDelta: 92,
  },
  {
    id: "7",
    time: "14:35",
    type: "risk",
    title: "Step-up verification sent",
    description: "Biometric + OTP challenge",
    severity: "warn",
    riskDelta: 64,
  },
  {
    id: "8",
    time: "15:02",
    type: "login",
    title: "Identity restored",
    description: "Owner re-verified via video KYC",
    severity: "success",
    riskDelta: 18,
  },
];

export const liveActivity = [
  {
    id: "a1",
    user: "+8801712••3411",
    action: "Loan application",
    decision: "approve" as const,
    score: 18,
    time: "2s ago",
  },
  {
    id: "a2",
    user: "+8801911••8821",
    action: "Send Money R12,400",
    decision: "step_up" as const,
    score: 47,
    time: "8s ago",
  },
  {
    id: "a3",
    user: "+8801533••0027",
    action: "Login attempt",
    decision: "block" as const,
    score: 81,
    time: "14s ago",
  },
  {
    id: "a4",
    user: "+8801812••9912",
    action: "Withdraw R5,000",
    decision: "approve" as const,
    score: 11,
    time: "22s ago",
  },
  {
    id: "a5",
    user: "+8801677••5512",
    action: "Send Money R800",
    decision: "approve" as const,
    score: 7,
    time: "34s ago",
  },
  {
    id: "a6",
    user: "+8801999••7100",
    action: "Card link",
    decision: "step_up" as const,
    score: 42,
    time: "48s ago",
  },
];

export const riskTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  approved: Math.floor(120 + Math.sin(i / 3) * 40 + Math.random() * 30),
  flagged: Math.floor(20 + Math.cos(i / 4) * 8 + Math.random() * 10),
  blocked: Math.floor(4 + Math.random() * 6),
}));

export const stats = {
  decisionsToday: 18429,
  blockRate: 2.4,
  approveRate: 91.3,
  avgLatency: 187,
  fraudPrevented: "R 4.82 Cr",
};
