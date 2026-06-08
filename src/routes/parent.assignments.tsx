import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, Eye } from "lucide-react";
import { assignments } from "@/lib/mock";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/parent/assignments")({ component: Page });

type Assignment = (typeof assignments)[number];
const subjectsList = ["All", ...Array.from(new Set(assignments.map(a => a.subject)))];

function Page() {
  const [view, setView] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [tab, setTab] = useState<"All" | "Pending" | "Submitted" | "Overdue">("All");

  const filtered = assignments.filter(a => {
    if (filter !== "All" && a.subject !== filter) return false;
    if (tab === "All") return true;
    if (tab === "Overdue") return a.priority === "high" && a.status !== "Submitted";
    return a.status === tab;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" subtitle="Track your child's assignments, deadlines and submissions." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Assignments" value={assignments.length} tint="violet" />
        <StatCard icon={Clock} label="Pending" value={assignments.filter(a => a.status === "Pending").length} tint="amber" />
        <StatCard icon={CheckCircle2} label="Submitted" value={assignments.filter(a => a.status === "Submitted").length} tint="emerald" />
        <StatCard icon={AlertTriangle} label="Overdue" value={assignments.filter(a => a.priority === "high" && a.status !== "Submitted").length} tint="rose" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {(["All", "Pending", "Submitted", "Overdue"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  tab === t ? "gradient-primary text-white shadow-soft" : "bg-muted text-foreground/70 hover:bg-muted/80"
                }`}>{t}</button>
            ))}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs">
            {subjectsList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((a, i) => {
            const statusBg = a.status === "Submitted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : a.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
            const accent = a.priority === "high" ? "border-l-rose-500" : a.priority === "medium" ? "border-l-amber-500" : "border-l-emerald-500";
            return (
              <div key={i} className={`p-4 rounded-2xl border border-border border-l-4 ${accent} bg-card hover:shadow-soft transition-shadow`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide font-bold text-primary">{a.subject}</div>
                    <div className="font-semibold mt-1">{a.title}</div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${statusBg}`}>{a.status}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due {a.due}</div>
                  <button onClick={() => setView(a)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><Eye className="w-3.5 h-3.5" /> View</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={!!view} onOpenChange={o => !o && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{view?.title}</DialogTitle>
            <DialogDescription>{view?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <Row k="Due Date" v={view?.due ?? "—"} />
            <Row k="Status" v={view?.status ?? "—"} />
            <Row k="Priority" v={view?.priority ?? "—"} />
          </div>
          <DialogFooter>
            <button onClick={() => setView(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
