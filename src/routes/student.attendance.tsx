import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import {
  CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Download,
  Eye, BookOpen, RefreshCw,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/student/attendance")({ component: Page });

type SubjectStatus = "Excellent" | "Good" | "Average" | "Low";

interface SubjectStat {
  name: string;
  total: number;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
  status: SubjectStatus;
}

interface AttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  subjectWise: Record<string, { total: number; attended: number; absent: number; late: number; percentage: number }>;
}

interface AttendanceLog {
  _id: string;
  subject: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  remarks: string;
}

const getStatus = (pct: number): SubjectStatus => {
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  if (pct >= 50) return "Average";
  return "Low";
};

const statusColor: Record<SubjectStatus, string> = {
  Excellent: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  Good: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  Average: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  Low: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
};
const barColor: Record<SubjectStatus, string> = {
  Excellent: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Good: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Average: "bg-gradient-to-r from-amber-400 to-orange-500",
  Low: "bg-gradient-to-r from-rose-400 to-rose-600",
};

function buildWeeklyTrend(logs: AttendanceLog[]) {
  // Aggregate into 6 most recent ISO weeks
  const weekMap: Record<string, { present: number; total: number }> = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const year = d.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const key = `W${week}`;
    if (!weekMap[key]) weekMap[key] = { present: 0, total: 0 };
    weekMap[key].total++;
    if (log.status === "Present" || log.status === "Late") weekMap[key].present++;
  }
  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([week, { present, total }]) => ({
      week,
      value: total > 0 ? Math.round((present / total) * 100) : 0,
    }));
}

function Page() {
  const { user } = useAuth();
  const token = user?.token;

  const [studentId, setStudentId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Get student profile to find studentId
        const profileRes = await fetch(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (!profileData.success) throw new Error(profileData.message || "Failed to load profile");
        const sid = profileData.data.profile._id;
        setStudentId(sid);

        // Step 2: Fetch summary
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
        ...s,
        status: getStatus(s.percentage),
      }))
    : [];

  const lowSubjects = subjectStats.filter(s => s.percentage < 70);
  const atRisk = subjectStats.filter(s => s.percentage < 75).length;
  const trendData = buildWeeklyTrend(logs);

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
  const overall = hasData ? `${summary.overallPercentage}%` : "No attendance recorded yet";
  const attendedStr = hasData ? String(summary.attended) : "—";
  const absentStr = hasData ? String(summary.absent) : "—";
  const totalClasses = summary?.totalClasses ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Overview" subtitle="Track your attendance and stay updated."
        action={
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value={overall} tint="violet" sub={hasData ? (summary.overallPercentage >= 75 ? "Good" : "At Risk") : "—"} />
        <StatCard icon={CheckCircle2} label="Classes Attended" value={attendedStr} tint="emerald" sub={hasData ? `of ${totalClasses}` : "—"} />
        <StatCard icon={XCircle} label="Classes Absent" value={absentStr} tint="rose" sub={hasData ? `of ${totalClasses}` : "—"} />
        <StatCard icon={AlertTriangle} label="At Risk Subjects" value={hasData ? atRisk : "—"} tint="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div className="flex gap-6 text-sm">
              <button className="font-semibold text-primary border-b-2 border-primary pb-2 -mb-3">Subject-wise Attendance</button>
            </div>
          </div>
          {subjectStats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No attendance data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground text-left text-xs uppercase">
                  <th className="py-2">Subject</th><th>Attendance</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {subjectStats.map(s => (
                    <tr key={s.name} className="border-t border-border row-hover">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.attended}/{s.total} classes</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold w-10 tabular-nums">{s.percentage}%</span>
                          <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${barColor[s.status]}`} style={{ width: `${s.percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[s.status]}`}>{s.status}</span></td>
                      <td><button className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Eye className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (85%+)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Good (70–84%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Average (50–69%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Low (Below 50%)</span>
          </div>
        </Card>

        <div className="space-y-6">
          {lowSubjects.length > 0 && (
            <Card className="p-5 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-rose-500" /><h3 className="font-semibold text-rose-700 dark:text-rose-300">Low Attendance Alert</h3></div>
              <p className="text-sm text-muted-foreground mb-3">You have <strong>{lowSubjects.length}</strong> subjects with low attendance.</p>
              <div className="space-y-3">
                {lowSubjects.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1"><span>{s.name}</span><span className="font-bold text-rose-600">{s.percentage}%</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${barColor[s.status]}`} style={{ width: `${s.percentage}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}
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
        {trendData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No trend data available yet.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs><linearGradient id="aa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0.4} /><stop offset="100%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                <XAxis dataKey="week" stroke="oklch(0.50 0.03 270)" fontSize={12} />
                <YAxis stroke="oklch(0.50 0.03 270)" fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} fill="url(#aa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-400/30 flex items-center gap-3 text-sm text-blue-900 dark:text-blue-100">
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</div>
        <span><strong>Note:</strong> Minimum 75% attendance is required to appear for university examinations.</span>
      </div>
    </div>
  );
}
