import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { ClipboardList, Plus, FileText, Users, CheckCircle2, Clock, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/faculty/assignments")({ component: Page });

interface Item { title: string; subject: string; due: string; submitted: number; total: number; status: "Active" | "Closed"; priority: "high" | "medium" | "low" }

const seed: Item[] = [
  { title: "DBMS Normalization Exercise", subject: "DBMS (CS305)", due: "20 May 2025", submitted: 48, total: 60, status: "Active", priority: "high" },
  { title: "Binary Tree Implementation", subject: "Data Structures (CS304)", due: "22 May 2025", submitted: 35, total: 60, status: "Active", priority: "medium" },
  { title: "ER Diagram Case Study", subject: "DBMS (CS305)", due: "25 May 2025", submitted: 12, total: 60, status: "Active", priority: "high" },
  { title: "Linked List Lab Report", subject: "DS Lab", due: "15 May 2025", submitted: 60, total: 60, status: "Closed", priority: "low" },
  { title: "Recursion Practice Set", subject: "Data Structures (CS304)", due: "28 May 2025", submitted: 5, total: 60, status: "Active", priority: "low" },
];

const LS_KEY = "cc_faculty_assignments_v1";

function Page() {
  const [items, setItems] = useState<Item[]>(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) return JSON.parse(raw); } catch {}
    return seed;
  });
  const [composerOpen, setComposerOpen] = useState(false);
  const [view, setView] = useState<Item | null>(null);

  const persist = (next: Item[]) => { setItems(next); try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {} };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Create, distribute and track assignment submissions."
        action={
          <button onClick={() => setComposerOpen(true)} className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)]">
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Assignments" value={items.length} tint="violet" />
        <StatCard icon={CheckCircle2} label="Submissions Received" value={items.reduce((a, i) => a + i.submitted, 0)} tint="emerald" />
        <StatCard icon={Clock} label="Pending Review" value={items.filter(i => i.status === "Active").reduce((a, i) => a + (i.total - i.submitted), 0)} tint="amber" />
        <StatCard icon={AlertTriangle} label="Overdue" value={items.filter(i => i.priority === "high" && i.status === "Active").length} tint="rose" />
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">All Assignments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs uppercase border-b border-border">
                <th className="py-3">Title</th><th>Subject</th><th>Due Date</th><th>Submissions</th><th>Priority</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => {
                const pct = (a.submitted / a.total) * 100;
                return (
                  <tr key={i} className="border-b border-border row-hover">
                    <td className="py-3 font-semibold">{a.title}</td>
                    <td className="text-muted-foreground">{a.subject}</td>
                    <td>{a.due}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{a.submitted}/{a.total}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ring-1 ${a.priority === "high" ? "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30" : a.priority === "medium" ? "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/30" : "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30"}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${a.status === "Active" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                    </td>
                    <td><button onClick={() => setView(a)} className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-primary" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="hidden"><FileText /><Users /></div>

      <ComposerDialog open={composerOpen} onOpenChange={setComposerOpen} onCreate={(it) => persist([it, ...items])} />
      <ViewDialog item={view} onOpenChange={() => setView(null)} />
    </div>
  );
}

function ComposerDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (i: Item) => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Data Structures (CS304)");
  const [due, setDue] = useState("");
  const [total, setTotal] = useState(60);
  const [priority, setPriority] = useState<Item["priority"]>("medium");
  const reset = () => { setTitle(""); setSubject("Data Structures (CS304)"); setDue(""); setTotal(60); setPriority("medium"); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !due) { toast.error("Title and due date are required"); return; }
    onCreate({ title: title.trim(), subject, due, total, submitted: 0, status: "Active", priority });
    toast.success("Assignment created successfully");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>Distribute to your selected subject and section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} className="cc-modal-input" placeholder="e.g. Sorting Algorithms Exercise" /></Field>
          <Field label="Subject">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="cc-modal-input">
              <option>Data Structures (CS304)</option><option>DBMS (CS305)</option><option>Advanced Databases (CS501)</option><option>Machine Learning (CS601)</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date"><input type="date" value={due} onChange={e => setDue(e.target.value)} className="cc-modal-input" /></Field>
            <Field label="Total Students"><input type="number" min={1} value={total} onChange={e => setTotal(+e.target.value)} className="cc-modal-input" /></Field>
          </div>
          <Field label="Priority">
            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="cc-modal-input">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </Field>
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Create</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewDialog({ item, onOpenChange }: { item: Item | null; onOpenChange: () => void }) {
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onOpenChange()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item?.title}</DialogTitle>
          <DialogDescription>{item?.subject}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Row k="Due Date" v={item?.due ?? "—"} />
          <Row k="Submissions" v={`${item?.submitted ?? 0} / ${item?.total ?? 0}`} />
          <Row k="Priority" v={item?.priority ?? "—"} />
          <Row k="Status" v={item?.status ?? "—"} />
        </div>
        <DialogFooter>
          <button onClick={onOpenChange} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border/60 py-2"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>;
}
