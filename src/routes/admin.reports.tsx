import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, StatusPill, GhostButton } from "@/components/admin-ui";
import { Users, IdCard, Users2, ClipboardCheck, Star, Calendar, Download, FileText, ArrowRight, AlertTriangle, ClipboardList, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { downloadPDF } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({ component: Page });

const attendance = ["1 May","6 May","11 May","16 May","21 May","26 May","31 May"].map((d,i)=>({d, cur:[55,68,62,72,78,72,80][i], prev:[50,60,58,68,70,68,75][i]}));
const perf = [
  { label: "Excellent (90-100%) 412 (16.6%)", value: 412, color: "#10b981" },
  { label: "Very Good (75-89%) 892 (35.9%)",   value: 892, color: "#3b82f6" },
  { label: "Good (60-74%) 720 (28.9%)",        value: 720, color: "#f59e0b" },
  { label: "Average (40-59%) 302 (12.1%)",     value: 302, color: "#a855f7" },
  { label: "Fail (Below 40%) 160 (6.5%)",      value: 160, color: "#ef4444" },
];
const depts = [
  { d: "Computer Science",      v: 90.2, c: "from-emerald-500 to-emerald-400" },
  { d: "Information Technology", v: 88.1, c: "from-sky-500 to-sky-400" },
  { d: "Electronics & Comm.",   v: 86.5, c: "from-amber-500 to-amber-400" },
  { d: "Mechanical Engineering", v: 84.3, c: "from-violet-500 to-violet-400" },
  { d: "Civil Engineering",      v: 81.7, c: "from-rose-500 to-rose-400" },
];
const top = [
  { n: "Arjun Sharma",   dept: "Computer Science",       cg: 9.45, att: "96%", st: "Excellent", tone:"success" },
  { n: "Priya Patel",    dept: "Information Technology", cg: 9.21, att: "94%", st: "Excellent", tone:"success" },
  { n: "Rohan Verma",    dept: "Electronics & Comm.",    cg: 9.05, att: "93%", st: "Excellent", tone:"success" },
  { n: "Sneha Reddy",    dept: "Computer Science",       cg: 8.92, att: "92%", st: "Very Good", tone:"info" },
  { n: "Karthik Nair",   dept: "Mechanical Engineering", cg: 8.78, att: "91%", st: "Very Good", tone:"info" },
];
const alerts = [
  { i: AlertTriangle,   tint: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",       t: "32 students have attendance below 75%", s: "Needs immediate attention" },
  { i: ClipboardList,   tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",   t: "15 assignments are pending evaluation",  s: "Across all departments" },
  { i: AlertTriangle,   tint: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300", t: "5 students are at risk of failing in 2 or more subjects", s: "Check performance" },
  { i: CheckCircle2,    tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300", t: "Attendance has improved by 6.3% this month", s: "Great job! Keep it up." },
];
const reports = [
  "Student Attendance Report","Faculty Performance Report","Department Summary Report","Exam Results Report","Parent Communication Report","Monthly Activity Report",
];

function Page() {
  const [range, setRange] = useState({ from: "2024-05-01", to: "2024-05-31" });
  const [dateOpen, setDateOpen] = useState(false);
  const fmt = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const exportAll = () => {
    const body = `Period: ${fmt(range.from)} – ${fmt(range.to)}<br/>Total Students: 2,486<br/>Faculty: 156<br/>Parents: 1,872<br/>Attendance Rate: 87.6%<br/>Pass %: 91.4%`;
    downloadPDF("Campus Connect Report", body, `campus-report-${range.from}-to-${range.to}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive insights and analytics for smarter decision making."
        action={<div className="flex gap-2 flex-wrap">
          <button onClick={() => setDateOpen(true)} className="flex items-center gap-2 px-3 h-10 rounded-xl border border-border bg-card text-sm hover:bg-muted/60 transition-colors"><Calendar className="w-4 h-4 text-muted-foreground" />{fmt(range.from)} - {fmt(range.to)}</button>
          <GhostButton icon={Download} onClick={exportAll}>Export Report</GhostButton>
        </div>}
      />



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Users}          label="Total Students"    value="2,486" tint="violet"  trend="5.2% from last month" />
        <MetricCard icon={IdCard}         label="Total Faculty"     value="156"   tint="emerald" trend="3.1% from last month" />
        <MetricCard icon={Users2}         label="Total Parents"     value="1,872" tint="amber"   trend="4.8% from last month" />
        <MetricCard icon={ClipboardCheck} label="Attendance Rate"   value="87.6%" tint="blue"    trend="6.3% from last month" />
        <MetricCard icon={Star}           label="Pass Percentage"   value="91.4%" tint="rose"    trend="4.7% from last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Attendance Overview" action={<select className="h-9 px-3 rounded-lg border border-border bg-background text-[12px]"><option>Monthly</option></select>}>
          <div className="h-[220px]">
            <ResponsiveContainer><AreaChart data={attendance}>
              <defs><linearGradient id="a1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" />
              <Area type="monotone" dataKey="cur" stroke="#7c3aed" strokeWidth={2.5} fill="url(#a1)" />
            </AreaChart></ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-[11.5px] mt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-600" />Attendance %</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" />Previous Month %</span>
          </div>
        </SectionCard>

        <SectionCard title="Student Performance Overview">
          <div className="flex items-center gap-3">
            <Donut size={150} data={perf} center={<><div className="text-[14px] font-extrabold">2,486</div><div className="text-[9.5px] text-muted-foreground">Total Students</div></>} />
            <ul className="space-y-1 text-[10.5px] flex-1">{perf.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
          </div>
        </SectionCard>

        <SectionCard title="Department Wise Attendance" action={<select className="h-9 px-3 rounded-lg border border-border bg-background text-[12px]"><option>All Departments</option></select>}>
          <ul className="space-y-3.5">
            {depts.map(d => (
              <li key={d.d}>
                <div className="flex items-center justify-between text-[12px] mb-1.5"><span className="font-medium">{d.d}</span><span className="font-bold">{d.v}%</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-gradient-to-r ${d.c}`} style={{ width: `${d.v}%` }} /></div>
              </li>
            ))}
            <div className="flex justify-between text-[10px] text-muted-foreground pt-1"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Top Performing Students" padding="p-0" className="lg:col-span-1">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead><tr className="text-[10px] uppercase text-muted-foreground bg-muted/40">
                <th className="px-3 py-2.5 text-left">#</th><th className="px-3 py-2.5 text-left">Student Name</th><th className="px-3 py-2.5 text-left">Department</th><th className="px-3 py-2.5 text-left">CGPA</th><th className="px-3 py-2.5 text-left">Att.</th><th className="px-3 py-2.5 text-left">Status</th>
              </tr></thead>
              <tbody>{top.map((s,i)=>(
                <tr key={s.n} className="border-t border-border/60"><td className="px-3 py-2.5">{i+1}</td><td className="px-3 py-2.5 font-semibold">{s.n}</td><td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{s.dept}</td><td className="px-3 py-2.5 font-semibold">{s.cg}</td><td className="px-3 py-2.5">{s.att}</td><td className="px-3 py-2.5"><StatusPill tone={s.tone as any}>{s.st}</StatusPill></td></tr>
              ))}</tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border/60"><button className="w-full h-9 rounded-lg border border-border text-[12px] font-semibold hover:bg-muted/60">View All Students</button></div>
        </SectionCard>

        <SectionCard title="Alerts & Insights" action={<a className="text-[12px] font-semibold text-primary">View All Alerts →</a>}>
          <ul className="space-y-2.5">
            {alerts.map((a,i)=>(
              <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.tint}`}><a.i className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0 text-[12px]"><div className="font-semibold leading-tight">{a.t}</div><div className="text-[11px] text-muted-foreground mt-0.5">{a.s}</div></div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-2" />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Quick Reports" action={<a className="text-[12px] font-semibold text-primary">View All Reports →</a>}>
          <ul className="space-y-2">
            {reports.map(r => (
              <li key={r} onClick={() => downloadPDF(r, `<p>${r}<br/>Period: ${fmt(range.from)} – ${fmt(range.to)}</p>`)} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>
                <span className="flex-1 text-[12.5px] font-medium">{r}</span>
                <button onClick={(e) => { e.stopPropagation(); downloadPDF(r, `<p>${r}<br/>Period: ${fmt(range.from)} – ${fmt(range.to)}</p>`); }} className="w-7 h-7 rounded-lg hover:bg-primary/10 text-primary flex items-center justify-center"><Download className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Select Date Range</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const from = String(fd.get("from")); const to = String(fd.get("to")); if (new Date(from) > new Date(to)) { toast.error("Start date must be before end date"); return; } setRange({ from, to }); toast.success("Date range updated"); setDateOpen(false); }} className="space-y-3">
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Start Date</span><input name="from" type="date" defaultValue={range.from} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">End Date</span><input name="to" type="date" defaultValue={range.to} className="cc-input mt-1" /></label>
            <DialogFooter>
              <button type="button" onClick={() => setDateOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">Apply</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
