import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import {
  FileText, CheckCircle2, Users, BarChart3, Download, Upload, MoreVertical,
  Code2, Database, Network, Sigma, Cog, BookOpen, Trophy, Lightbulb, CheckCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/faculty/marks")({ component: Page });

const subjects = [
  { code: "CS304", name: "Data Structures", max: 30, students: 60, uploaded: true, avg: 78.6, icon: Code2, color: "violet" },
  { code: "CS305", name: "Database Management Systems", max: 30, students: 60, uploaded: true, avg: 74.2, icon: Database, color: "emerald" },
  { code: "CS306", name: "Computer Networks", max: 30, students: 60, uploaded: true, avg: 81.3, icon: Network, color: "blue" },
  { code: "MA201", name: "Discrete Mathematics", max: 30, students: 60, uploaded: true, avg: 69.8, icon: Sigma, color: "rose" },
  { code: "CS307", name: "Operating Systems", max: 30, students: 60, uploaded: true, avg: 77.5, icon: Cog, color: "amber" },
  { code: "CS308", name: "Software Engineering", max: 30, students: 60, uploaded: false, avg: null, icon: BookOpen, color: "fuchsia" },
];

const perfData = [
  { name: "Excellent (80% and above)", value: 28, color: "#10b981" },
  { name: "Good (60% - 79%)", value: 20, color: "#3b82f6" },
  { name: "Average (40% - 59%)", value: 8, color: "#f59e0b" },
  { name: "Below Average (Below 40%)", value: 4, color: "#ef4444" },
];

const tabs = ["Upload Marks", "View & Edit Marks", "Grade Analysis", "Performance Insights"];

type Subj = (typeof subjects)[number];

function Page() {
  const [tab, setTab] = useState(tabs[0]);
  const [editor, setEditor] = useState<Subj | null>(null);
  const [showAllTop, setShowAllTop] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Dashboard"
        subtitle="Manage and upload internal marks for your subjects."
        action={
          <div className="flex gap-2">
            <select className="h-11 px-4 rounded-xl border border-border bg-card text-sm"><option>CSE - 3rd Year (A)</option></select>
            <select className="h-11 px-4 rounded-xl border border-border bg-card text-sm"><option>Semester 4</option></select>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Subjects" value="6" tint="violet" sub="This Semester" />
        <StatCard icon={CheckCircle2} label="Marks Uploaded" value="5 / 6" tint="emerald" sub="Subjects" />
        <StatCard icon={Users} label="Total Students" value="60" tint="amber" sub="In Your Class" />
        <StatCard icon={BarChart3} label="Average Score" value="76.48%" tint="blue" sub="Class Average" />
      </div>

      {/* Tabs + buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-border w-full sm:w-auto overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV("marks-template.csv", [{ Roll: "23CSE001", Name: "Student Name", Internal: 0, External: 0 }])} className="h-11 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary/5">
            <Download className="w-4 h-4" /> Download Template
          </button>
          <button onClick={() => void uploadFiles("Marks file", ".csv,.xlsx")} className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)]">
            <Upload className="w-4 h-4" /> Upload Marks
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Subject-wise Marks Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left text-xs uppercase border-b border-border">
                  <th className="py-3">Subject</th>
                  <th>Internal Max Marks</th>
                  <th>Students</th>
                  <th>Uploaded</th>
                  <th>Class Average</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => {
                  const Ic = s.icon;
                  const bg: Record<string, string> = {
                    violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
                    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
                    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
                    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
                    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
                    fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
                  };
                  const avgColor = s.avg == null ? "text-muted-foreground" : s.avg >= 80 ? "text-emerald-600 dark:text-emerald-300" : s.avg >= 70 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300";
                  return (
                    <tr key={s.code} className="border-b border-border row-hover">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg[s.color]}`}><Ic className="w-5 h-5" /></div>
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.code}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.max}</td>
                      <td>{s.students}</td>
                      <td>
                        {s.uploaded
                          ? <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30 font-semibold">Yes</span>
                          : <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30 font-semibold">No</span>}
                      </td>
                      <td className={`font-bold ${avgColor}`}>{s.avg != null ? `${s.avg.toFixed(2)}%` : "—"}</td>
                      <td>
                        {s.uploaded
                          ? <button onClick={() => setEditor(s)} className="px-3 h-8 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5">View / Edit</button>
                          : <button onClick={() => void uploadFiles(`${s.code} marks`, ".csv,.xlsx")} className="px-3 h-8 rounded-lg bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-xs font-bold">Upload Marks</button>}
                      </td>
                      <td><button onClick={() => downloadCSV(`${s.code}-marks.csv`, [{ Subject: s.name, Code: s.code, Max: s.max, Students: s.students, Average: s.avg ?? "—" }])} className="p-1.5 rounded-lg hover:bg-muted" title="Export CSV"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Overall Class Performance</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={perfData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2} stroke="none">
                      {perfData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-extrabold">76.48%</div>
                  <div className="text-[10px] text-muted-foreground">Average</div>
                </div>
              </div>
              <ul className="space-y-2 text-xs flex-1">
                {perfData.map((d, i) => {
                  const pct = ((d.value / 60) * 100).toFixed(2);
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 truncate">{d.name}</span>
                      <span className="font-bold">{d.value}</span>
                      <span className="text-muted-foreground">({pct}%)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Top Performers</h3>
              <button onClick={() => setShowAllTop(v => !v)} className="text-xs font-semibold text-primary hover:underline">{showAllTop ? "Show Top 3" : "View All"}</button>
            </div>
            <div className="space-y-3">
              {([
                { rank: 1, name: "Ananya Sharma", pct: "93.67%" },
                { rank: 2, name: "Rohan Verma", pct: "91.33%" },
                { rank: 3, name: "Priya Nair", pct: "89.17%" },
                { rank: 4, name: "Karthik Reddy", pct: "87.50%" },
                { rank: 5, name: "Sneha Iyer", pct: "85.83%" },
                { rank: 6, name: "Arjun Mehta", pct: "84.17%" },
                { rank: 7, name: "Neha Singh", pct: "82.67%" },
              ]).slice(0, showAllTop ? 7 : 3).map(p => (
                <div key={p.rank} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.rank === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : p.rank === 2 ? "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300" : p.rank === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" : "bg-muted text-muted-foreground"}`}>
                    {p.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full gradient-primary text-white flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{p.pct}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-3">Recent Marks Uploads</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs uppercase border-b border-border">
                <th className="py-3">Date</th><th>Subject</th><th>Type</th><th>Total Students</th><th>Uploaded By</th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: "20 May 2025", s: "Data Structures (CS304)", t: "Internal Test 2" },
                { d: "18 May 2025", s: "Database Management (CS305)", t: "Internal Test 1" },
                { d: "15 May 2025", s: "Computer Networks (CS306)", t: "Internal Test 2" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-border row-hover">
                  <td className="py-3">{r.d}</td>
                  <td className="font-medium">{r.s}</td>
                  <td>{r.t}</td>
                  <td>60</td>
                  <td>Dr. Priya Sharma</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => downloadCSV("marks-upload-history.csv", [{ Date: "20 May 2025", Subject: "Data Structures (CS304)", Type: "Internal Test 2", Students: 60, UploadedBy: "Dr. Priya Sharma" }, { Date: "18 May 2025", Subject: "Database Management (CS305)", Type: "Internal Test 1", Students: 60, UploadedBy: "Dr. Priya Sharma" }, { Date: "15 May 2025", Subject: "Computer Networks (CS306)", Type: "Internal Test 2", Students: 60, UploadedBy: "Dr. Priya Sharma" }])} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">View All Upload History →</button>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-violet-50/60 via-card to-card dark:from-violet-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold">Quick Tips</h3>
          </div>
          <ul className="space-y-2.5 text-sm">
            {[
              "Upload marks in CSV or Excel format using the template.",
              "Ensure maximum marks are correct before uploading.",
              "Students can view marks once published.",
              "You can edit marks before publishing.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* silence unused */}
      <div className="hidden"><Trophy /></div>

      <MarksEditorDialog subj={editor} onClose={() => setEditor(null)} />
    </div>
  );
}

function MarksEditorDialog({ subj, onClose }: { subj: Subj | null; onClose: () => void }) {
  const [rows, setRows] = useState<{ roll: string; name: string; mark: number }[]>([]);
  useEffect(() => {
    if (!subj) { setRows([]); return; }
    setRows(Array.from({ length: 8 }, (_, i) => ({
      roll: `23CSE0${(i + 1).toString().padStart(2, "0")}`,
      name: ["Ananya Sharma","Rohan Verma","Priya Nair","Karthik Reddy","Sneha Iyer","Arjun Mehta","Neha Singh","Aditya Patil"][i],
      mark: Math.floor((subj.avg ?? 75) - 5 + Math.random() * 10),
    })));
  }, [subj]);
  const close = () => onClose();
  const save = () => { toast.success(`Marks saved for ${subj?.code}`); close(); };
  return (
    <Dialog open={!!subj} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{subj?.name} ({subj?.code})</DialogTitle>
          <DialogDescription>Edit student marks (max {subj?.max}).</DialogDescription>
        </DialogHeader>
        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground sticky top-0">
              <tr><th className="text-left px-3 py-2">Roll</th><th className="text-left px-3">Name</th><th className="text-right px-3">Marks</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.roll} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{r.roll}</td>
                  <td className="px-3">{r.name}</td>
                  <td className="px-3 text-right">
                    <input type="number" min={0} max={subj?.max ?? 30} value={r.mark}
                      onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, mark: +e.target.value } : x))}
                      className="w-20 h-8 px-2 rounded-lg border border-border bg-background text-right text-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter>
          <button onClick={close} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={save} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Save Marks</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
