import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Calendar, Filter, Upload, Download, Plus, Eye, ClipboardCheck, FileText, Bell } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { downloadCSV, downloadPDF, importTableFile, uploadFiles } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/attendance")({ component: Page });

const tabs = ["By Class", "By Course", "By Faculty", "By Department"];
const trend = ["24 May","25 May","26 May","27 May","28 May","29 May","30 May"].map((d,i)=>({d, v:[86,89,90,88,90,91,92.45][i]}));
const rows = [
  { cls: "CSE - 3A", dept: "Computer Science",      total: 68, p: 62, a: 4, l: 2, pct: 91.18 },
  { cls: "IT - 2B",  dept: "Information Technology", total: 62, p: 55, a: 5, l: 2, pct: 88.71 },
  { cls: "ME - 3A",  dept: "Mechanical Engineering", total: 70, p: 61, a: 7, l: 2, pct: 87.14 },
  { cls: "EC - 2A",  dept: "Electronics & Comm.",   total: 58, p: 48, a: 7, l: 3, pct: 82.76 },
  { cls: "CE - 4A",  dept: "Civil Engineering",     total: 64, p: 56, a: 6, l: 2, pct: 87.50 },
  { cls: "CSE - 1B", dept: "Computer Science",      total: 65, p: 60, a: 4, l: 1, pct: 92.31 },
  { cls: "EE - 3B",  dept: "Electrical Engineering", total: 59, p: 49, a: 8, l: 2, pct: 83.05 },
  { cls: "ME - 2B",  dept: "Mechanical Engineering", total: 61, p: 54, a: 5, l: 2, pct: 88.52 },
];
const dept = [
  { label: "Computer Science 92.81% (725/781)",  value: 725, color: "#7c3aed" },
  { label: "Information Tech 91.23% (512/562)",  value: 512, color: "#06b6d4" },
  { label: "Mechanical Eng. 90.12% (540/599)",   value: 540, color: "#10b981" },
  { label: "Electronics & C. 89.45% (426/476)",  value: 426, color: "#f59e0b" },
  { label: "Civil Eng. 91.02% (482/529)",        value: 482, color: "#ef4444" },
  { label: "Electrical Eng. 90.11% (503/558)",   value: 503, color: "#8b5cf6" },
];

function Page() {
  const [tab, setTab] = useState(0);
  const [markOpen, setMarkOpen] = useState(false);
  const [viewing, setViewing] = useState<typeof rows[number] | null>(null);
  const data = rows;
  const navigate = useNavigate();
  const exportData = () => downloadCSV("attendance.csv", data);
  const importData = async () => {
    const r = await importTableFile("Import Attendance");
    if (r?.rows?.length) toast.success(`${r.rows.length} attendance rows imported`);
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Management" subtitle="Monitor and manage attendance across all departments, classes and students."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={importData}>Import Attendance</GhostButton>
          <GhostButton icon={Download} onClick={exportData}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setMarkOpen(true)}>Mark Attendance</PrimaryButton>
        </div>}
      />
      <PageToolbar>
        <Select label="Select Department" /><Select label="Select Course" /><Select label="Select Class / Section" />
        <label className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background text-sm cursor-pointer hover:bg-muted/60"><Calendar className="w-4 h-4 text-muted-foreground" /><input type="date" defaultValue={new Date().toISOString().slice(0,10)} onChange={(e) => toast.success(`Date set to ${new Date(e.target.value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}`)} className="bg-transparent outline-none cursor-pointer" /></label>
        <GhostButton icon={Filter} onClick={() => toast.success("Filters applied")}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={CalendarCheck} label="Overall Attendance" value="92.45%" tint="violet"  trend="3.25% this month" />
        <MetricCard icon={CheckCircle2}  label="Present Today"      value="2,188"  tint="emerald" trend="120 from yesterday" />
        <MetricCard icon={XCircle}       label="Absent Today"       value="212"    tint="rose"    trend="18 from yesterday" trendDir="down" />
        <MetricCard icon={Clock}         label="Late Today"         value="50"     tint="amber"   trend="6 from yesterday" trendDir="down" />
        <MetricCard icon={Calendar}      label="Total Classes"      value="326"    tint="blue"    trend="No changes" trendDir="flat" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Attendance Overview" action={
          <div className="flex bg-muted/40 rounded-xl p-1">
            {tabs.map((t, i) => (
              <button key={t} onClick={()=>setTab(i)} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg ${tab===i ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        } padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 text-left">Class / Section</th><th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Total Students</th><th className="px-4 py-3 text-left">Present</th>
                <th className="px-4 py-3 text-left">Absent</th><th className="px-4 py-3 text-left">Late</th>
                <th className="px-4 py-3 text-left">Attendance %</th><th className="px-4 py-3 text-left">Action</th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.cls} className="border-t border-border/60 hover:bg-primary/5">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center"><ClipboardCheck className="w-3.5 h-3.5" /></div>{r.cls}</td>
                    <td className="px-4 py-3">{r.dept}</td><td className="px-4 py-3">{r.total}</td>
                    <td className="px-4 py-3">{r.p}</td><td className="px-4 py-3">{r.a}</td><td className="px-4 py-3">{r.l}</td>
                    <td className="px-4 py-3"><StatusPill tone={r.pct >= 88 ? "success" : r.pct >= 83 ? "warning" : "danger"}>{r.pct.toFixed(2)}%</StatusPill></td>
                    <td className="px-4 py-3"><button onClick={() => setViewing(r)} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border/60">
            <div className="text-[12px] text-muted-foreground">Showing 1 to 8 of 24 classes</div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border hover:bg-muted text-sm">‹</button>
              {[1,2,3].map(n => (<button key={n} className={`w-8 h-8 rounded-lg text-sm font-semibold ${n===1 ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" : "hover:bg-muted"}`}>{n}</button>))}
              <button className="w-8 h-8 rounded-lg border border-border hover:bg-muted text-sm">›</button>
              <select className="ml-2 h-8 px-2 rounded-lg border border-border bg-background text-xs"><option>10 / page</option></select>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Attendance Trend" subtitle="Last 7 Days">
            <div className="h-[180px]">
              <ResponsiveContainer><AreaChart data={trend}>
                <defs><linearGradient id="aT2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="d" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aT2)" />
              </AreaChart></ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Attendance by Department">
            <div className="flex items-center gap-3">
              <Donut size={130} data={dept} center={<><div className="text-[16px] font-extrabold">92.45%</div><div className="text-[9.5px] text-muted-foreground">Overall</div></>} />
              <ul className="space-y-1 text-[10.5px] flex-1">{dept.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={ClipboardCheck} label="Mark Attendance" tint="emerald" onClick={() => setMarkOpen(true)} />
              <QuickActionTile icon={Upload} label="Bulk Attendance" tint="blue" onClick={() => uploadFiles("Bulk Attendance", ".csv,.xlsx")} />
              <QuickActionTile icon={FileText} label="Attendance Report" tint="amber" onClick={() => downloadPDF("Attendance Report", `Overall: 92.45%\nPresent today: 2,188\nAbsent today: 212`)} />
              <QuickActionTile icon={Calendar} label="Daily Summary" tint="violet" onClick={exportData} />
              <QuickActionTile icon={Bell} label="Notifications" tint="rose" onClick={() => navigate({ to: "/admin/notifications" })} />
            </div>
          </SectionCard>
        </div>
      </div>
      <Dialog open={markOpen} onOpenChange={setMarkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Select class and date to begin marking attendance.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const cls = fd.get("cls"); const date = fd.get("date");
              toast.success(`Attendance saved for ${cls} on ${date}`);
              setMarkOpen(false);
            }}
            className="grid grid-cols-2 gap-3"
          >
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Class / Section</span>
              <select name="cls" className="cc-input mt-1">{data.map(r => <option key={r.cls}>{r.cls}</option>)}</select>
            </label>
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Date</span>
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} className="cc-input mt-1" />
            </label>
            <DialogFooter className="col-span-2">
              <button type="button" onClick={() => setMarkOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold">Save Attendance</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewing} onOpenChange={v => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.cls} Attendance</DialogTitle>
            <DialogDescription>{viewing?.dept}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-muted-foreground">Total</div><div className="font-semibold">{viewing.total}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Present</div><div className="font-semibold">{viewing.p}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Absent</div><div className="font-semibold">{viewing.a}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Late</div><div className="font-semibold">{viewing.l}</div></div>
              <div className="col-span-2"><div className="text-[11px] text-muted-foreground">Attendance %</div><div className="font-semibold">{viewing.pct.toFixed(2)}%</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Select({ label }: { label: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[180px]"><option>{label}</option></select>; }
