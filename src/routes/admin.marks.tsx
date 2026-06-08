import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { ClipboardList, GraduationCap, Trophy, CheckCircle2, FileCheck, Plus, Upload, Download, Filter, Eye, Pencil, Search, Edit3, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV, downloadPDF, importTableFile, uploadFiles } from "@/lib/files";

export const Route = createFileRoute("/admin/marks")({ component: Page });

type Row = { roll: string; name: string; dept: string; sem: string; sub: number; total: string; pct: number; grade: string; status: "Pass" | "Fail" };

const dist = [
  { label: "90-100% (A+) 18% (441)", value: 441, color: "#7c3aed" },
  { label: "80-90% (A) 32% (784)",   value: 784, color: "#06b6d4" },
  { label: "70-80% (B+) 24% (588)",  value: 588, color: "#10b981" },
  { label: "60-70% (B) 16% (392)",   value: 392, color: "#f59e0b" },
  { label: "50-60% (C) 7% (171)",    value: 171, color: "#ef4444" },
  { label: "Below 50% (F) 3% (74)",  value: 74,  color: "#8b5cf6" },
];

const initial: Row[] = [
  { roll: "23CSE001", name: "Ananya Sharma", dept: "CSE", sem: "4th Semester", sub: 6, total: "542 / 600", pct: 90.33, grade: "A+", status: "Pass" },
  { roll: "23CSE002", name: "Rohan Verma",   dept: "CSE", sem: "4th Semester", sub: 6, total: "498 / 600", pct: 83.00, grade: "A",  status: "Pass" },
  { roll: "23IT003",  name: "Priya Nair",    dept: "IT",  sem: "4th Semester", sub: 6, total: "486 / 600", pct: 81.00, grade: "A",  status: "Pass" },
  { roll: "23ME004",  name: "Karthik Reddy", dept: "ME",  sem: "4th Semester", sub: 6, total: "465 / 600", pct: 77.50, grade: "B+", status: "Pass" },
  { roll: "23EC005",  name: "Sneha Iyer",    dept: "ECE", sem: "4th Semester", sub: 6, total: "452 / 600", pct: 75.33, grade: "B+", status: "Pass" },
  { roll: "23CE006",  name: "Arjun Mehta",   dept: "CE",  sem: "4th Semester", sub: 6, total: "438 / 600", pct: 73.00, grade: "B",  status: "Pass" },
  { roll: "23EE007",  name: "Neha Singh",    dept: "EE",  sem: "4th Semester", sub: 6, total: "412 / 600", pct: 68.67, grade: "B",  status: "Pass" },
  { roll: "23CS008",  name: "Aditya Patil",  dept: "CS",  sem: "4th Semester", sub: 6, total: "376 / 600", pct: 62.67, grade: "C+", status: "Pass" },
  { roll: "23PH009",  name: "Meera Joshi",   dept: "CSE", sem: "4th Semester", sub: 6, total: "577 / 600", pct: 96.20, grade: "A+", status: "Pass" },
];
const top = [
  { rank: "🏆", name: "Meera Joshi (CSE)",   v: "96.20%" },
  { rank: "2",  name: "Ananya Sharma (CSE)", v: "90.33%" },
  { rank: "🥉", name: "Rohan Verma (CSE)",   v: "83.00%" },
  { rank: "4",  name: "Priya Nair (IT)",     v: "81.00%" },
  { rank: "5",  name: "Karthik Reddy (ME)",  v: "77.50%" },
];

function gradeFor(p: number) {
  if (p >= 90) return "A+"; if (p >= 80) return "A"; if (p >= 70) return "B+";
  if (p >= 60) return "B"; if (p >= 50) return "C"; return "F";
}

function Page() {
  const [rows, setRows] = useState<Row[]>(initial);
  const [open, setOpen] = useState<{ mode: "create" | "edit"; row?: Row } | null>(null);
  const [published, setPublished] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const roll = String(fd.get("roll") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const dept = String(fd.get("dept") || "CSE");
    const sem = String(fd.get("sem") || "4th Semester");
    const sub = Number(fd.get("sub") || 6);
    const obtained = Number(fd.get("obtained") || 0);
    const max = Number(fd.get("max") || sub * 100);
    if (!roll || !name) return;
    const pct = Number(((obtained / Math.max(1, max)) * 100).toFixed(2));
    const grade = gradeFor(pct);
    const next: Row = { roll, name, dept, sem, sub, total: `${obtained} / ${max}`, pct, grade, status: pct >= 40 ? "Pass" : "Fail" };
    if (open?.mode === "edit" && open.row) {
      setRows(prev => prev.map(r => r.roll === open.row!.roll ? next : r));
      toast.success(`Marks updated for ${name}`);
    } else {
      setRows(prev => [next, ...prev]);
      toast.success(`Marks saved for ${name}`);
    }
    setOpen(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Marks Management" subtitle="Manage and analyze student marks and academic performance."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={async () => { const r = await importTableFile("Marks", ".csv,.xlsx"); if (r?.rows?.length) toast.success(`${r.rows.length} rows imported`); }}>Import Marks</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("marks.csv", rows)}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setOpen({ mode: "create" })}>Enter Marks</PrimaryButton>
        </div>}
      />
      <PageToolbar>
        <Sel l="Select Department" /><Sel l="Select Course" /><Sel l="Select Semester" /><Sel l="Select Exam Type" />
        <div className="h-11 px-3 rounded-xl border border-border bg-background text-sm flex items-center">May - June 2026</div>
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={ClipboardList} label="Total Students"    value={String(2440 + rows.length - initial.length)}  tint="violet"  trend="120 this month" />
        <MetricCard icon={GraduationCap} label="Average Marks"     value={`${(rows.reduce((a, r) => a + r.pct, 0) / Math.max(1, rows.length)).toFixed(2)}%`} tint="emerald" trend="4.25% this month" />
        <MetricCard icon={Trophy}        label="Highest Marks"     value={`${Math.max(...rows.map(r => r.pct)).toFixed(2)}%`} tint="amber"   trend="Top performer" />
        <MetricCard icon={CheckCircle2}  label="Pass Percentage"   value={`${((rows.filter(r => r.status === "Pass").length / Math.max(1, rows.length)) * 100).toFixed(2)}%`} tint="rose"    trend="3.10% this month" />
        <MetricCard icon={FileCheck}     label="Results Declared"  value={published ? "327" : "326"}    tint="blue"    trend={published ? "Published" : "Pending"} trendDir="flat" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Student Marks Overview" padding="p-0" action={
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/40 rounded-xl p-1">
              {["By Student","By Subject","By Exam Type"].map((t,i)=>(<button key={t} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg ${i===0?"bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow":"text-muted-foreground"}`}>{t}</button>))}
            </div>
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-background text-sm w-[180px]"><Search className="w-3.5 h-3.5 text-muted-foreground" /><input placeholder="Search student..." className="bg-transparent outline-none text-[12px] flex-1" /></div>
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40"><th className="px-4 py-3 text-left w-10"><input type="checkbox" /></th><th className="px-4 py-3 text-left">Roll No</th><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Dept</th><th className="px-4 py-3 text-left">Semester</th><th className="px-4 py-3 text-left">Subjects</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">%</th><th className="px-4 py-3 text-left">Grade</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.roll} className="border-t border-border/60 hover:bg-primary/5">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold">{r.roll}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{r.name.split(" ").map(n=>n[0]).join("")}</div><span className="font-semibold">{r.name}</span></div></td>
                    <td className="px-4 py-3">{r.dept}</td><td className="px-4 py-3">{r.sem}</td><td className="px-4 py-3">{r.sub}</td><td className="px-4 py-3">{r.total}</td><td className="px-4 py-3 font-semibold">{r.pct}%</td>
                    <td className="px-4 py-3"><StatusPill tone={r.grade.startsWith("A")?"success":r.grade.startsWith("B")?"info":"warning"}>{r.grade}</StatusPill></td>
                    <td className="px-4 py-3"><StatusPill tone={r.status==="Pass"?"success":"danger"}>{r.status}</StatusPill></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={() => toast(r.name, { description: `${r.roll} · ${r.total} · ${r.pct}% (${r.grade})` })} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setOpen({ mode: "edit", row: r })} className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Marks Distribution">
            <div className="flex flex-col items-center gap-3">
              <Donut size={150} data={dist} center={<><div className="text-[16px] font-extrabold">2,450</div><div className="text-[9.5px] text-muted-foreground">Students</div></>} />
              <ul className="space-y-1 text-[10.5px] w-full">{dist.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>
          <SectionCard title="Top Performers" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-2.5 text-[12.5px]">{top.map((t,i)=>(<li key={i} className="flex items-center gap-2"><div className="w-6 text-center">{t.rank}</div><div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{t.name[0]}</div><div className="flex-1 font-medium">{t.name}</div><div className="font-bold">{t.v}</div></li>))}</ul>
          </SectionCard>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={Edit3} label="Enter Marks" tint="violet" onClick={() => setOpen({ mode: "create" })} />
              <QuickActionTile icon={Upload} label="Bulk Upload" tint="emerald" onClick={() => uploadFiles("Bulk Marks", ".csv,.xlsx")} />
              <QuickActionTile icon={Download} label="Generate Report" tint="amber" onClick={() => downloadPDF("Marks Report", `<p>Average: ${(rows.reduce((a,r)=>a+r.pct,0)/rows.length).toFixed(2)}% across ${rows.length} students.</p>`)} />
              <QuickActionTile icon={Send} label={published ? "Unpublish Results" : "Publish Results"} tint="fuchsia" onClick={() => { setPublished(p => !p); toast.success(published ? "Results unpublished" : "Results published"); }} />
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{open?.mode === "edit" ? `Edit Marks — ${open.row?.name}` : "Enter Marks"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Roll No.</span><input name="roll" required defaultValue={open?.row?.roll} disabled={open?.mode === "edit"} className="cc-input mt-1" placeholder="e.g. 25CSE010" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Student Name</span><input name="name" required defaultValue={open?.row?.name} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Department</span><input name="dept" defaultValue={open?.row?.dept ?? "CSE"} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Semester</span><input name="sem" defaultValue={open?.row?.sem ?? "4th Semester"} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Subjects</span><input name="sub" type="number" min={1} defaultValue={open?.row?.sub ?? 6} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Max Marks</span><input name="max" type="number" min={1} defaultValue={open?.row ? Number(open.row.total.split("/")[1]?.trim()) : 600} className="cc-input mt-1" /></label>
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Marks Obtained</span><input name="obtained" type="number" min={0} required defaultValue={open?.row ? Number(open.row.total.split("/")[0]?.trim()) : 0} className="cc-input mt-1" /></label>
            <DialogFooter className="col-span-2">
              <button type="button" onClick={() => setOpen(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">{open?.mode === "edit" ? "Save Marks" : "Save Marks"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Sel({ l }: { l: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[160px]"><option>{l}</option></select>; }
