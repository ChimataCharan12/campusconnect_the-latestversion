import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { Plane, Check, X, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/leave")({ component: Page });

const initial = [
  { roll: "23CSE003", name: "Priya Nair", reason: "Medical leave", from: "20 May 2025", to: "22 May 2025", days: 3, status: "Pending" },
  { roll: "23CSE007", name: "Neha Singh", reason: "Family function", from: "23 May 2025", to: "24 May 2025", days: 2, status: "Pending" },
  { roll: "23CSE012", name: "Ananya Mehta", reason: "Hackathon participation", from: "25 May 2025", to: "27 May 2025", days: 3, status: "Pending" },
  { roll: "23CSE018", name: "Rohan Sharma", reason: "Medical leave", from: "18 May 2025", to: "19 May 2025", days: 2, status: "Approved" },
  { roll: "23CSE021", name: "Karthik Reddy", reason: "Personal", from: "15 May 2025", to: "15 May 2025", days: 1, status: "Rejected" },
];

function Page() {
  const [rows, setRows] = useState(initial);
  const pending = rows.filter(r => r.status === "Pending").length;
  const approved = rows.filter(r => r.status === "Approved").length;
  const rejected = rows.filter(r => r.status === "Rejected").length;
  const update = (roll: string, status: string) => { setRows(rs => rs.map(r => r.roll === roll ? { ...r, status } : r)); toast.success(`Request ${status.toLowerCase()}`); };
  const view = (r: any) => toast.info(`${r.name} · ${r.roll}`, { description: `${r.reason} · ${r.from} → ${r.to} (${r.days} day${r.days > 1 ? "s" : ""}) · ${r.status}` });
  return (
    <div className="space-y-6">
      <PageHeader title="Leave Requests" subtitle="Review and approve student leave applications." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Plane} label="Total Requests" value={rows.length} tint="violet" />
        <StatCard icon={Clock} label="Pending Review" value={pending} tint="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} tint="emerald" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} tint="rose" />
      </div>
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">All Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs uppercase border-b border-border">
                <th className="py-3">Roll No.</th><th>Student</th><th>Reason</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.roll} className="border-b border-border row-hover">
                  <td className="py-3 font-mono text-xs font-semibold">{r.roll}</td>
                  <td className="font-medium">{r.name}</td>
                  <td className="text-muted-foreground">{r.reason}</td>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td>{r.days}</td>
                  <td>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ring-1 ${r.status === "Approved" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30" : r.status === "Rejected" ? "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30" : "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/30"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "Pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => update(r.roll, "Approved")} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200"><Check className="w-4 h-4" /></button>
                        <button onClick={() => update(r.roll, "Rejected")} className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200"><X className="w-4 h-4" /></button>
                        <button onClick={() => view(r)} className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                      </div>
                    ) : (
                      <button onClick={() => view(r)} className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
