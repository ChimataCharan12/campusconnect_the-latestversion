import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { Bot, MessageSquare, FileText, AlertCircle, Users, Star, Plus, ExternalLink, Filter, Calendar, Eye, Pencil, Trash2, GraduationCap, Upload, Settings, BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV, uploadFiles } from "@/lib/files";

export const Route = createFileRoute("/admin/chatbot")({ component: Page });

type Intent = { name: string; cat: string; catTint: string; kw: number; td: number; sr: number; status: "Active" | "Inactive" };

const initialIntents: Intent[] = [
  { name: "Admission Process",     cat: "Admission",  catTint: "info",    kw: 18, td: 245, sr: 98.21, status: "Active" },
  { name: "Fee Structure",         cat: "Finance",    catTint: "success", kw: 22, td: 310, sr: 96.45, status: "Active" },
  { name: "Exam Schedule",         cat: "Academics",  catTint: "warning", kw: 16, td: 198, sr: 94.32, status: "Active" },
  { name: "Transport Information", cat: "Facilities", catTint: "warning", kw: 14, td: 156, sr: 92.18, status: "Active" },
  { name: "Hostel Rules",          cat: "Facilities", catTint: "warning", kw: 12, td: 132, sr: 91.05, status: "Inactive" },
  { name: "Scholarship Info",      cat: "Finance",    catTint: "success", kw: 11, td: 110, sr: 93.10, status: "Active" },
  { name: "Placement Support",     cat: "Placement",  catTint: "info",    kw: 15, td: 176, sr: 95.62, status: "Active" },
];
const cats = [
  { label: "Academics 35% (4,496)", value: 4496, color: "#ef4444" },
  { label: "Admission 25% (3,210)", value: 3210, color: "#06b6d4" },
  { label: "Finance 15% (1,928)",   value: 1928, color: "#10b981" },
  { label: "Facilities 15% (1,892)", value: 1892, color: "#f59e0b" },
  { label: "Placement 5% (642)",     value: 642,  color: "#7c3aed" },
  { label: "Others 5% (677)",        value: 677,  color: "#8b5cf6" },
];
const trend = ["24","25","26","27","28","29","30"].map((d,i)=>({d:d+" May", v:[1200,1450,1320,1500,1600,1700,1842][i]}));
const recent = [
  { who: "RS Rohan Sharma", role: "Student", q: "What is the admission process?", cat: "Admission", status: "Resolved", sol: "Provided admission steps and required documents.", time: "30 May 2026 11:24 AM" },
  { who: "PS Priya Singh",  role: "Parent",  q: "What are the hostel rules?",     cat: "Facilities", status: "Resolved", sol: "Shared hostel rules and guidelines PDF.",          time: "30 May 2026 10:48 AM" },
  { who: "AK Amit Kumar",   role: "Student", q: "When is the next internal exam?", cat: "Academics", status: "Resolved", sol: "Provided upcoming internal exam schedule.",        time: "30 May 2026 09:15 AM" },
];

function Page() {
  const [intents, setIntents] = useState<Intent[]>(initialIntents);
  const [open, setOpen] = useState(false);

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const cat = String(fd.get("cat") || "Academics");
    const kw = Number(fd.get("kw") || 0);
    if (!name) return;
    const tintMap: Record<string,string> = { Admission:"info", Finance:"success", Academics:"warning", Facilities:"warning", Placement:"info" };
    setIntents(prev => [{ name, cat, catTint: tintMap[cat] ?? "info", kw, td: 0, sr: 0, status: "Active" }, ...prev]);
    toast.success(`Intent "${name}" created`);
    setOpen(false);
  };

  const removeIntent = (n: string) => { setIntents(prev => prev.filter(i => i.name !== n)); toast.success(`Intent "${n}" deleted`); };
  const toggleStatus = (n: string) => setIntents(prev => prev.map(i => i.name === n ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" } : i));

  return (
    <div className="space-y-6">
      <PageHeader title="AI Chatbot Management" subtitle="Configure, train and monitor the AI chatbot for your campus."
        action={<div className="flex gap-2"><GhostButton icon={ExternalLink} onClick={() => window.open("/student/chatbot", "_blank")}>View Chatbot</GhostButton><PrimaryButton icon={Plus} onClick={() => setOpen(true)}>Create New Intent</PrimaryButton></div>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Bot}          label="Total Conversations" value="12,845" tint="violet"  trend="18.45% this month" />
        <MetricCard icon={MessageSquare} label="Resolved Queries"   value="9,752"  tint="emerald" trend="22.35% this month" />
        <MetricCard icon={FileText}     label="Unresolved Queries"  value="1,245"  tint="amber"   trend="8.12% this month" trendDir="down" />
        <MetricCard icon={Users}        label="Active Users"        value="3,412"  tint="blue"    trend="15.32% this month" />
        <MetricCard icon={Star}         label="Satisfaction Rate"   value="95.42%" tint="rose"    trend="4.25% this month" />
      </div>
      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background"><input placeholder="Search intents or keywords..." className="flex-1 bg-transparent outline-none text-sm" /></div>
        <Sel l="All Categories" /><Sel l="All Status" /><Sel l="All Departments" />
        <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background text-sm"><Calendar className="w-4 h-4 text-muted-foreground" />May 24 – May 30, 2026</div>
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Intent Management" subtitle="Manage chatbot intents, training data and responses." padding="p-0">
          <div className="flex gap-1 px-6 border-b border-border/60">
            {["All Intents","Training Data","Fallbacks","Keywords","Settings"].map((t,i)=>(<button key={t} className={`px-3 py-3 text-[12.5px] font-semibold ${i===0?"text-primary border-b-2 border-primary":"text-muted-foreground"}`}>{t}</button>))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40"><th className="px-4 py-3 text-left">Intent Name</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Keywords</th><th className="px-4 py-3 text-left">Trained Data</th><th className="px-4 py-3 text-left">Success Rate</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
              <tbody>{intents.map(it => (
                <tr key={it.name} className="border-t border-border/60 hover:bg-primary/5">
                  <td className="px-4 py-3 font-semibold flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center"><Bot className="w-3.5 h-3.5" /></div>{it.name}</td>
                  <td className="px-4 py-3"><StatusPill tone={it.catTint as any}>{it.cat}</StatusPill></td>
                  <td className="px-4 py-3">{it.kw}</td><td className="px-4 py-3">{it.td}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full border-[3px] border-emerald-500" /><span className="font-semibold">{it.sr}%</span></div></td>
                  <td className="px-4 py-3"><button onClick={() => toggleStatus(it.name)}><StatusPill tone={it.status==="Active"?"success":"danger"}>{it.status}</StatusPill></button></td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => toast(it.name, { description: `Category: ${it.cat} · Keywords: ${it.kw} · Trained: ${it.td}` })} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toast.message(`Edit "${it.name}"`, { description: "Open in editor" })} className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeIntent(it.name)} className="w-7 h-7 rounded-lg hover:bg-muted text-rose-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Chatbot Overview" subtitle="This Week">
            <div className="h-[160px]">
              <ResponsiveContainer><AreaChart data={trend}>
                <defs><linearGradient id="cb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="d" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#cb1)" />
              </AreaChart></ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Top Query Categories" subtitle="This Week">
            <div className="flex items-center gap-3">
              <Donut size={130} data={cats} center={<><div className="text-[14px] font-extrabold">12,845</div><div className="text-[9.5px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1 text-[10.5px] flex-1">{cats.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={GraduationCap} label="Train New Intent" tint="violet" onClick={() => setOpen(true)} />
              <QuickActionTile icon={Upload} label="Upload Training Data" tint="emerald" onClick={() => uploadFiles("Training Data", ".csv,.json,.xlsx")} />
              <QuickActionTile icon={AlertCircle} label="Manage Fallbacks" tint="amber" onClick={() => toast("Fallbacks", { description: "3 fallback responses configured" })} />
              <QuickActionTile icon={BarChart3} label="Chatbot Analytics" tint="blue" onClick={() => downloadCSV("chatbot-analytics.csv", intents.map(i => ({ intent: i.name, category: i.cat, keywords: i.kw, trained: i.td, successRate: i.sr, status: i.status })))} />
              <QuickActionTile icon={Settings} label="Settings & Config" tint="fuchsia" onClick={() => toast("Chatbot settings opened") } />
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Recent Conversations" action={<a className="text-[12px] font-semibold text-primary">View All Conversations →</a>} padding="p-0">
        <div className="overflow-x-auto"><table className="w-full text-[13px] min-w-[800px]">
          <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40"><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Query</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Solution</th><th className="px-4 py-3 text-left">Time</th></tr></thead>
          <tbody>{recent.map((r,i)=>(<tr key={i} className="border-t border-border/60"><td className="px-4 py-3"><div className="leading-tight"><div className="font-semibold">{r.who}</div><div className="text-[10.5px] text-muted-foreground">{r.role}</div></div></td><td className="px-4 py-3">{r.q}</td><td className="px-4 py-3"><StatusPill tone="info">{r.cat}</StatusPill></td><td className="px-4 py-3"><StatusPill tone="success">{r.status}</StatusPill></td><td className="px-4 py-3 text-muted-foreground text-[12px]">{r.sol}</td><td className="px-4 py-3 text-[11px] text-muted-foreground">{r.time}</td></tr>))}</tbody>
        </table></div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Intent</DialogTitle></DialogHeader>
          <form onSubmit={onCreate} className="space-y-3">
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Intent Name</span><input name="name" required className="cc-input mt-1" placeholder="e.g. Library Timings" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Category</span>
              <select name="cat" className="cc-input mt-1">
                {["Admission","Finance","Academics","Facilities","Placement"].map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Keywords (count)</span><input name="kw" type="number" min={0} defaultValue={5} className="cc-input mt-1" /></label>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">Create Intent</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Sel({ l }: { l: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[150px]"><option>{l}</option></select>; }
