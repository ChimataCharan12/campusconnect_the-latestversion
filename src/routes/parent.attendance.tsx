import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import {
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Download,
  ChevronRight, BookOpen, TrendingUp, RefreshCw,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/parent/attendance")({ component: Page });

type SubjectStatus = "Excellent" | "Good" | "Average" | "Low";

interface ChildProfile {
  _id: string;
  rollNumber: string;
  branch: string;
  section: string;
  year: number;
  userId: { name: string; email: string };
}

interface SubjectStat {
  name: string;
  total: number;
  attended: number;
  absent: number;
  percentage: number;
  status: SubjectStatus;
}

interface AttendanceLog {
  _id: string;
  subject: string;
  date: string;
  status: "Present" | "Absent" | "Late";
}

const getStatus = (pct: number): SubjectStatus => {
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  if (pct >= 50) return "Average";
  return "Low";
};

const statusColor: Record<SubjectStatus, string> = {
  Excellent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Average: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};
const barColor: Record<SubjectStatus, string> = {
  Excellent: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Good: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Average: "bg-gradient-to-r from-amber-400 to-orange-500",
  Low: "bg-gradient-to-r from-rose-400 to-rose-600",
};
const iconBg: Record<SubjectStatus, string> = {
  Excellent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  Good: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  Average: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

function buildMonthlyTrend(logs: AttendanceLog[]) {
  const monthMap: Record<string, { present: number; total: number }> = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const key = d.toLocaleString("en-US", { month: "short" });
    if (!monthMap[key]) monthMap[key] = { present: 0, total: 0 };
    monthMap[key].total++;
    if (log.status === "Present" || log.status === "Late") monthMap[key].present++;
  }
  return Object.entries(monthMap)
    .slice(-6)
    .map(([m, { present, total }]) => ({
      m,
      v: total > 0 ? Math.round((present / total) * 100) : 0,
    }));
}

function Page() {
  const { user } = useAuth();
  const token = user?.token;

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [summary, setSummary] = useState<{ overallPercentage: number; totalClasses: number; attended: number; absent: number; late: number; subjectWise: Record<string, any> } | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRec, setShowRec] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: get parent's children
        const childrenRes = await fetch(`${API_BASE}/api/parents/children`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childrenData = await childrenRes.json();
        if (!childrenData.success || !childrenData.data?.children?.length) {
          setError("No linked children found.");
          return;
        }
        const firstChild: ChildProfile = childrenData.data.children[0];
        setChild(firstChild);
        const sid = firstChild._id;

        // Step 2: fetch summary and logs in parallel
        const [summaryRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/api/attendance/summary/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/attendance/student/${sid}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const summaryData = await summaryRes.json();
        const logsData = await logsRes.json();

        if (summaryData.success) setSummary(summaryData.data);
        if (logsData.success) setLogs(logsData.data.logs || []);
      } catch (e: any) {
        setError(e.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const subjectStats: SubjectStat[] = summary
    ? Object.entries(summary.subjectWise).map(([name, s]) => ({
        name,
        total: s.total,
        attended: s.attended,
        absent: s.absent,
        percentage: s.percentage,
        status: getStatus(s.percentage),
      }))
    : [];

  const low = subjectStats.filter(s => s.percentage < 70);
  const atRisk = subjectStats.filter(s => s.percentage < 75).length;
  const trendData = buildMonthlyTrend(logs);
  const recentLogs = [...logs].slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading attendance...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rose-500 text-sm">{error}</div>
      </div>
    );
  }

  const hasData = summary && summary.totalClasses > 0;
  const overallVal = hasData ? `${summary.overallPercentage}%` : "No attendance recorded yet";
  const attendedVal = hasData ? String(summary.attended) : "—";
  const absentVal = hasData ? String(summary.absent) : "—";
  const totalClasses = summary?.totalClasses ?? 0;
  const initials = child?.userId?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Monitor your child's attendance and stay informed."
        action={
          <div className="flex flex-wrap gap-2">
            {child && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
                <div className="w-7 h-7 rounded-full gradient-primary text-white text-[10px] flex items-center justify-center font-bold">{initials}</div>
                <div className="leading-tight">
                  <div className="font-semibold text-xs">{child.userId?.name}</div>
                  <div className="text-[10px] text-muted-foreground">{child.branch} · {child.year}Y ({child.section})</div>
                </div>
              </div>
            )}
            <button className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5 hover:bg-muted">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value={overallVal} tint="emerald" sub={hasData ? (summary.overallPercentage >= 75 ? "Good · This Month" : "Below Threshold") : "—"} />
        <StatCard icon={CheckCircle2} label="Classes Attended" value={attendedVal} tint="blue" sub={hasData ? `of ${totalClasses}` : "—"} />
        <StatCard icon={XCircle} label="Classes Absent" value={absentVal} tint="rose" sub={hasData ? `of ${totalClasses}` : "—"} />
        <StatCard icon={AlertTriangle} label="At Risk Subjects" value={hasData ? atRisk : "—"} tint="amber" sub={hasData ? "Low Attendance" : "—"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-bold text-lg mb-4">Subject-wise Attendance</h2>
          {subjectStats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No attendance data available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground text-left text-[11px] uppercase tracking-wide bg-muted/40">
                  <th className="py-2.5 pl-3 rounded-l-lg">Subject</th><th className="py-2.5">Attendance</th><th className="py-2.5">Status</th><th className="py-2.5">Trend</th><th className="py-2.5 rounded-r-lg" />
                </tr></thead>
                <tbody>
                  {subjectStats.map(s => (
                    <tr key={s.name} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[s.status]}`}><BookOpen className="w-4 h-4" /></div>
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.attended}/{s.total} classes</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold w-10 tabular-nums">{s.percentage}%</span>
                          <div className="w-28 h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${barColor[s.status]}`} style={{ width: `${s.percentage}%` }} /></div>
                        </div>
                      </td>
                      <td><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[s.status]}`}>{s.status}</span></td>
                      <td><TrendingUp className={`w-4 h-4 ${s.percentage >= 70 ? "text-emerald-500" : "text-rose-500"}`} /></td>
                      <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {low.length > 0 && (
            <Card className="p-5 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/60 to-transparent dark:from-rose-500/5">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-rose-500" /><h3 className="font-bold text-rose-700 dark:text-rose-300">Low Attendance Alert</h3></div>
              <p className="text-xs text-muted-foreground mb-3">Your child has low attendance in the following subjects.</p>
              <div className="space-y-3">
                {low.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium">{s.name}</span><span className="font-bold text-rose-600">{s.percentage}%</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${barColor[s.status]}`} style={{ width: `${s.percentage}%` }} /></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowRec(v => !v)} className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-95 transition-opacity">
                {showRec ? "Hide" : "View"} Recommendations →
              </button>
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
          )}
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
          </div>
          {trendData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No trend data yet.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                  <XAxis dataKey="m" stroke="oklch(0.50 0.03 270)" fontSize={11} />
                  <YAxis stroke="oklch(0.50 0.03 270)" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.52 0.21 285)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Recent Attendance Records</h2>
          {recentLogs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No records yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-[11px] uppercase">
                <th className="pb-2">Date</th><th className="pb-2">Subject</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {recentLogs.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground">{new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-2.5 font-medium">{r.subject}</td>
                    <td className="py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${r.status === "Present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : r.status === "Late" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-400/30 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-100">
        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</div>
        <span><strong>Note:</strong> Minimum 75% attendance is required to appear for examinations.</span>
      </div>
    </div>
  );
}
