import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import { CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Download, ChevronRight, BookOpen, Database, Sigma, Network, Monitor, GraduationCap, TrendingUp } from "lucide-react";
import { subjects } from "@/lib/mock";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { downloadXLSX } from "@/lib/files";
import { useState } from "react";

export const Route = createFileRoute("/parent/attendance")({ component: Page });

const icons: Record<string, any> = {
  "Data Structures": BookOpen, "Database Management": Database, "Discrete Mathematics": Sigma,
  "Computer Networks": Network, "Operating Systems": Monitor, "Software Engineering": GraduationCap,
};
const statusColor: Record<string, string> = {
  Excellent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Average: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};
const barColor: Record<string, string> = {
  Excellent: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Good: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Average: "bg-gradient-to-r from-amber-400 to-orange-500",
  Low: "bg-gradient-to-r from-rose-400 to-rose-600",
};
const iconBg: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
};

const trend = [
  { m: "Dec", v: 76 }, { m: "Jan", v: 74 }, { m: "Feb", v: 78 },
  { m: "Mar", v: 80 }, { m: "Apr", v: 81 }, { m: "May", v: 82 },
];

const recent = [
  { date: "20 May 2025", subject: "Data Structures (CS304)", status: "Present" },
  { date: "19 May 2025", subject: "Database Management (CS305)", status: "Present" },
  { date: "19 May 2025", subject: "Computer Networks (CS306)", status: "Absent" },
  { date: "18 May 2025", subject: "Discrete Mathematics (MA201)", status: "Present" },
  { date: "18 May 2025", subject: "Operating Systems (CS307)", status: "Present" },
];

function Page() {
  const [showRec, setShowRec] = useState(false);
  const low = subjects.filter(s => s.attendance < 70);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Monitor your child's attendance and stay informed."
        action={
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
              <div className="w-7 h-7 rounded-full gradient-primary text-white text-[10px] flex items-center justify-center font-bold">AS</div>
              <div className="leading-tight">
                <div className="font-semibold text-xs">Ananya Sharma</div>
                <div className="text-[10px] text-muted-foreground">CSE · 3rd Year (A)</div>
              </div>
            </div>
            <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>May 2025</option><option>Apr 2025</option></select>
            <button onClick={() => downloadXLSX("attendance.xlsx", subjects, "Attendance")} className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5 hover:bg-muted"><Download className="w-4 h-4" /> Export</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value="82%" tint="emerald" sub="Good · This Month" />
        <StatCard icon={CheckCircle2} label="Classes Attended" value="98" tint="blue" sub="of 120 · 82%" />
        <StatCard icon={XCircle} label="Classes Absent" value="14" tint="rose" sub="of 120 · 12%" />
        <StatCard icon={AlertTriangle} label="At Risk Subjects" value="2" tint="amber" sub="Low Attendance" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-bold text-lg mb-4">Subject-wise Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-[11px] uppercase tracking-wide bg-muted/40">
                <th className="py-2.5 pl-3 rounded-l-lg">Subject</th><th className="py-2.5">Attendance</th><th className="py-2.5">Status</th><th className="py-2.5">Trend</th><th className="py-2.5 rounded-r-lg" />
              </tr></thead>
              <tbody>
                {subjects.map(s => {
                  const Icon = icons[s.name] ?? BookOpen;
                  return (
                    <tr key={s.code} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[s.color]}`}><Icon className="w-4 h-4" /></div>
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.code}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold w-10 tabular-nums">{s.attendance}%</span>
                          <div className="w-28 h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${barColor[s.status]}`} style={{ width: `${s.attendance}%` }} /></div>
                        </div>
                      </td>
                      <td><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[s.status]}`}>{s.status}</span></td>
                      <td><TrendingUp className={`w-4 h-4 ${s.attendance >= 70 ? "text-emerald-500" : "text-rose-500"}`} /></td>
                      <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/60 to-transparent dark:from-rose-500/5">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-rose-500" /><h3 className="font-bold text-rose-700 dark:text-rose-300">Low Attendance Alert</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Your child has low attendance in the following subjects.</p>
            <div className="space-y-3">
              {low.map(s => (
                <div key={s.code}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium">{s.name} ({s.code})</span><span className="font-bold text-rose-600">{s.attendance}%</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${barColor[s.status]}`} style={{ width: `${s.attendance}%` }} /></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRec(v => !v)} className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-95 transition-opacity">{showRec ? "Hide" : "View"} Recommendations →</button>
            {showRec && (
              <div className="mt-3 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10 p-3 text-xs space-y-1.5">
                <p>• Encourage daily attendance and on-time arrival.</p>
                <p>• Schedule remedial sessions for subjects below 75%.</p>
                <p>• Discuss progress with the subject faculty during PTM.</p>
                <p>• Set up a study routine focused on weak subjects.</p>
                <p>• Track weekly attendance via the parent portal.</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">💡 Tips for Better Attendance</h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• Attend all classes regularly.</li>
              <li>• Maintain at least 75% attendance in each subject.</li>
              <li>• Plan schedule and complete assignments on time.</li>
              <li>• Contact faculty if facing any difficulties.</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">Monthly Attendance Trend</h2>
            <select className="text-xs border border-border rounded-md px-2 py-1 bg-card"><option>6 Months</option><option>3 Months</option></select>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                <XAxis dataKey="m" stroke="oklch(0.50 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.50 0.03 270)" fontSize={11} domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.52 0.21 285)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Recent Attendance Records</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-muted-foreground text-left text-[11px] uppercase">
              <th className="pb-2">Date</th><th className="pb-2">Subject</th><th className="pb-2">Status</th>
            </tr></thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2.5 text-muted-foreground">{r.date}</td>
                  <td className="py-2.5">{r.subject}</td>
                  <td className="py-2.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${r.status === "Present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-400/30 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-100">
        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</div>
        <span><strong>Note:</strong> Minimum 75% attendance is required to appear for examinations.</span>
      </div>
    </div>
  );
}
