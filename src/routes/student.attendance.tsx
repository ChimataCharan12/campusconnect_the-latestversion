import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import { CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Download, Eye, BookOpen, Database, Sigma, Network, Monitor, GraduationCap } from "lucide-react";
import { subjects, attendanceTrend } from "@/lib/mock";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/student/attendance")({ component: Page });

const icons: Record<string, any> = {
  "Data Structures": BookOpen, "Database Management": Database, "Discrete Mathematics": Sigma,
  "Computer Networks": Network, "Operating Systems": Monitor, "Software Engineering": GraduationCap,
};

const statusColor: Record<string, string> = {
  Excellent: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  Good: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  Average: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  Low: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
};
const barColor: Record<string, string> = {
  Excellent: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Good: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Average: "bg-gradient-to-r from-amber-400 to-orange-500",
  Low: "bg-gradient-to-r from-rose-400 to-rose-600",
};
const iconBg: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600", blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600", rose: "bg-rose-100 text-rose-600",
  emerald: "bg-emerald-100 text-emerald-600", fuchsia: "bg-fuchsia-100 text-fuchsia-600",
};

function Page() {
  const low = subjects.filter(s => s.attendance < 70);
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Overview" subtitle="Track your attendance and stay updated."
        action={
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>Semester 4</option><option>Semester 3</option></select>
            <button className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5"><Download className="w-4 h-4" /> Export Report</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value="82%" tint="violet" sub="Good" />
        <StatCard icon={CheckCircle2} label="Classes Attended" value="98" tint="emerald" sub="of 120" />
        <StatCard icon={XCircle} label="Classes Absent" value="22" tint="rose" sub="of 120" />
        <StatCard icon={AlertTriangle} label="At Risk Subjects" value="2" tint="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div className="flex gap-6 text-sm">
              <button className="font-semibold text-primary border-b-2 border-primary pb-2 -mb-3">Subject-wise Attendance</button>
              <button className="text-muted-foreground">Attendance Calendar</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-xs uppercase">
                <th className="py-2">Subject</th><th>Attendance</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {subjects.map(s => {
                  const Icon = icons[s.name] ?? BookOpen;
                  return (
                    <tr key={s.code} className="border-t border-border row-hover">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-soft ${iconBg[s.color]}`}><Icon className="w-4 h-4" /></div>
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
                      <td><button className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Eye className="w-4 h-4" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (85%+)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Good (70-84%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Average (50-69%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Low (Below 50%)</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 border-l-4 border-l-rose-500">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-rose-500" /><h3 className="font-semibold text-rose-700 dark:text-rose-300">Low Attendance Alert</h3></div>
            <p className="text-sm text-muted-foreground mb-3">You have <strong>{low.length}</strong> subjects with low attendance.</p>
            <div className="space-y-3">
              {low.map(s => (
                <div key={s.code}>
                  <div className="flex justify-between text-xs mb-1"><span>{s.name} ({s.code})</span><span className="font-bold text-rose-600">{s.attendance}%</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${barColor[s.status]}`} style={{ width: `${s.attendance}%` }} /></div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-primary font-medium">View Low Attendance Policy →</button>
          </Card>

          <Card className="p-5 gradient-soft">
            <h3 className="font-semibold flex items-center gap-2">💡 Improve Your Attendance</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 mt-3">
              <li>• Attend all classes regularly</li>
              <li>• Check timetable and plan ahead</li>
              <li>• Contact faculty if you face issues</li>
              <li>• Maintain at least 75% in each subject</li>
            </ul>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-2">Weekly Attendance Trend</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={attendanceTrend}>
              <defs><linearGradient id="aa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0.4} /><stop offset="100%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
              <XAxis dataKey="week" stroke="oklch(0.50 0.03 270)" fontSize={12} />
              <YAxis stroke="oklch(0.50 0.03 270)" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} fill="url(#aa)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-400/30 flex items-center gap-3 text-sm text-blue-900 dark:text-blue-100">
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</div>
        <span><strong>Note:</strong> Minimum 75% attendance is required to appear for university examinations.</span>
      </div>
    </div>
  );
}
