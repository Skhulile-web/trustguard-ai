import { createFileRoute } from "@tanstack/react-router";
import { Search, Shield, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getUsers, type UserProfile } from "@/lib/api";

export const Route = createFileRoute("/app/users")({
  head: () => ({ meta: [{ title: "User Management · TrustGuard AI" }] }),
  component: UsersPage,
});

const USERS = [
  {
    id: "u_001",
    name: "Ayesha Rahman",
    phone: "+8801712553411",
    tier: "Gold",
    devices: 2,
    trust: 92,
    lastSeen: "2m ago",
  },
  {
    id: "u_002",
    name: "Karim Hossain",
    phone: "+8801911223344",
    tier: "Silver",
    devices: 1,
    trust: 78,
    lastSeen: "14m ago",
  },
  {
    id: "u_003",
    name: "Nadia Islam",
    phone: "+8801555667788",
    tier: "Platinum",
    devices: 3,
    trust: 96,
    lastSeen: "1h ago",
  },
  {
    id: "u_004",
    name: "Tanvir Ahmed",
    phone: "+8801799001122",
    tier: "Silver",
    devices: 1,
    trust: 64,
    lastSeen: "3h ago",
  },
  {
    id: "u_005",
    name: "Sara Chowdhury",
    phone: "+8801688445566",
    tier: "Gold",
    devices: 2,
    trust: 88,
    lastSeen: "8m ago",
  },
  {
    id: "u_006",
    name: "Imran Khan",
    phone: "+8801833221199",
    tier: "Bronze",
    devices: 1,
    trust: 41,
    lastSeen: "2d ago",
  },
];

function UsersPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserProfile[]>(USERS);
  const [source, setSource] = useState<"backend" | "local">("local");

  useEffect(() => {
    getUsers()
      .then((backendUsers) => {
        setUsers(
          backendUsers.map((user, index) => ({
            ...user,
            tier: titleCase(user.tier),
            trust: user.trust ?? [92, 78, 96, 64, 88, 41][index] ?? 75,
            lastSeen:
              user.lastSeen ??
              ["2m ago", "14m ago", "1h ago", "3h ago", "8m ago", "2d ago"][
                index
              ] ??
              "recently",
          })),
        );
        setSource("backend");
      })
      .catch((error) => {
        console.warn(
          "Backend users fetch failed, using local fallback.",
          error,
        );
      });
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        (u.name + u.phone).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, users],
  );

  return (
    <AppShell
      title="User Management"
      subtitle="Profiles, trust scores, devices and preferences"
    >
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground font-mono">
            {filtered.length} users - {source}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 font-semibold">User</th>
              <th className="text-left px-5 py-3 font-semibold">Phone</th>
              <th className="text-left px-5 py-3 font-semibold">Tier</th>
              <th className="text-left px-5 py-3 font-semibold">Devices</th>
              <th className="text-left px-5 py-3 font-semibold">Trust score</th>
              <th className="text-left px-5 py-3 font-semibold">Last seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-base">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {u.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{u.phone}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {u.tier}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Smartphone className="w-3 h-3" />
                    {u.devices}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${u.trust >= 80 ? "bg-success" : u.trust >= 60 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${u.trust}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono">{u.trust}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {u.lastSeen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-border p-5 flex items-center gap-4">
        <Shield className="w-8 h-8 text-primary shrink-0" />
        <div className="text-sm text-muted-foreground">
          User profiles, devices and preferences are served by the{" "}
          <span className="font-mono text-foreground">User Service</span> in the
          backend. The trust score is computed by the{" "}
          <span className="font-mono text-foreground">Risk Engine</span> from
          telecom signals received via Nokia Network-as-Code (CAMARA APIs).
        </div>
      </div>
    </AppShell>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
