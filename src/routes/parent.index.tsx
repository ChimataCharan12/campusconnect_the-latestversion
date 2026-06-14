import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, StatCard } from "@/components/AppShell";
import {
  CalendarCheck, GraduationCap, ClipboardList, Bell, ArrowRight, BookOpen, Megaphone,
  Calendar as CalendarIcon, DollarSign, Phone, Eye, FileText, Bot, RefreshCw,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { events } from "@/lib/mock";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/parent/")({ component: Page });

interface Activity {
  icon: any;
  tint: string;
  title: string;
  time: string;
  timestamp: number;
}

function aggregateStudentMarks(rawMarks: any[]) {
  const grouped: Record<string, { name: string; code: string; internal: number; external: number; total: number; grade: string }> = {};

  rawMarks.forEach((m) => {
    const sub = m.subject;
    if (!grouped[sub]) {
      grouped[sub] = {
        name: sub,
        code: sub.substring(0, 5).toUpperCase(),
        internal: 0,
        external: 0,
        total: 0,
        grade: "—"
      };
    }

    if (m.examType === "Internal 1" || m.examType === "Internal 2" || m.examType === "Assignment") {
      grouped[sub].internal += m.marksObtained;
    } else if (m.examType === "Semester") {
      grouped[sub].external += m.marksObtained;
    }
  });

  return Object.values(grouped).map((item) => {
    item.total = item.internal + item.external;
    const score = item.total;
    if (score >= 90) item.grade = "A+";
    else if (score >= 80) item.grade = "A";
    else if (score >= 70) item.grade = "B+";
    else if (score >= 60) item.grade = "B";
    else if (score >= 50) item.grade = "C";
    else if (score >= 40) item.grade = "D";
    else item.grade = "F";

    return item;
  });
}

function buildMonthlyAttendanceTrend(logs: any[]) {
  const monthMap: Record<string, { present: number; total: number }> = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const key = d.toLocaleString("en-US", { month: "short" });
    if (!monthMap[key]) monthMap[key] = { present: 0, total: 0 };
    monthMap[key].total++;
    if (log.status === "Present" || log.status === "Late") monthMap[key].present++;
  }
  return Object.entries(monthMap)
    .sort((a, b) => new Date(a[0] + " 1, 2026").getTime() - new Date(b[0] + " 1, 2026").getTime())
    .map(([month, { present, total }]) => ({
      month,
      value: total > 0 ? Math.round((present / total) * 100) : 0
    }));
}

function Page() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Widget States
  const [widgetsLoading, setWidgetsLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [rawMarks, setRawMarks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch Parent Profile
  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE}/api/parents/profile`, {
      headers: {
        "Authorization": `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.profile) {
          setProfile(res.data.profile);
        }
      })
      .catch((err) => console.error("Error fetching parent profile:", err))
      .finally(() => setLoading(false));
  }, [user?.token]);

  const parentName = profile?.userId?.name || user?.name || "Parent";
  const childrenList = profile?.children || [];
  const childData = childrenList[selectedChildIndex];

  // Fetch Live Child Widgets
  useEffect(() => {
    if (!user?.token || !childData?._id) return;
    const sid = childData._id;
    setWidgetsLoading(true);

    Promise.all([
      fetch(`${API_BASE}/api/attendance/summary/${sid}`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/marks/student/${sid}`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/fees/student/${sid}`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/notifications`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/attendance/student/${sid}`, { headers: { Authorization: `Bearer ${user.token}` } }).then(r => r.json())
    ])
      .then(([attSummaryRes, marksRes, feesRes, notifRes, logsRes]) => {
        if (attSummaryRes.success) setAttendanceSummary(attSummaryRes.data);
        if (marksRes.success) setRawMarks(marksRes.data.marks || []);
        if (feesRes.success) setInvoices(feesRes.data.invoices || []);
        if (notifRes.success) setNotificationsList(notifRes.data.notifications || []);
        if (logsRes.success) setRecentLogs(logsRes.data.logs || []);
      })
      .catch((err) => console.error("Error loading dashboard widgets:", err))
      .finally(() => setWidgetsLoading(false));
  }, [user?.token, childData?._id]);

  const childName = childData?.userId?.name || "No child linked";
  const childRoll = childData?.rollNumber || "";
  const childBranch = childData?.branch || "";
  const childSection = childData?.section || "";
  const childYear = childData?.year
    ? childData.year === 1
      ? "1st Year"
      : childData.year === 2
      ? "2nd Year"
      : childData.year === 3
      ? "3rd Year"
      : `${childData.year}th Year`
    : "";

  const initials = childData?.userId?.name
    ? childData.userId.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CS";

  // Calculations for dynamic widgets
  const overallAttendance = attendanceSummary?.overallPercentage ?? 0;
  const totalClasses = attendanceSummary?.totalClasses ?? 0;
  const attended = attendanceSummary?.attended ?? 0;
  const absent = attendanceSummary?.absent ?? 0;
  const late = attendanceSummary?.late ?? 0;

  const absentPercentage = totalClasses > 0 ? Math.round((absent / totalClasses) * 100) : 0;
  const latePercentage = totalClasses > 0 ? Math.round((late / totalClasses) * 100) : 0;

  const liveMarks = aggregateStudentMarks(rawMarks);
  const overallMarksPercentage = liveMarks.length > 0
    ? (liveMarks.reduce((sum, m) => sum + m.total, 0) / liveMarks.length).toFixed(1) + "%"
    : "—";

  const unpaidInvoices = invoices.filter((inv: any) => inv.status === "Unpaid" || inv.status === "Overdue");
  const pendingFeesTotal = unpaidInvoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const nearestInvoice = unpaidInvoices[0];
  const nearestDueDate = nearestInvoice
    ? new Date(nearestInvoice.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const unreadAnnouncementsCount = notificationsList.filter((n: any) => !n.isRead).length;

  // Recent Activities
  const activities: Activity[] = [];

  recentLogs.slice(0, 5).forEach((log: any) => {
    const logDate = new Date(log.date);
    activities.push({
      icon: CalendarCheck,
      tint: log.status === "Present" ? "bg-emerald-100 text-emerald-600" : log.status === "Late" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600",
      title: `Attendance marked ${log.status} for ${log.subject}`,
      time: logDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      timestamp: logDate.getTime()
    });
  });

  rawMarks.slice(-5).forEach((mark: any) => {
    const markDate = new Date(mark.createdAt || mark.updatedAt || new Date());
    activities.push({
      icon: GraduationCap,
      tint: "bg-blue-100 text-blue-600",
      title: `Marks released: ${mark.subject} (${mark.examType})`,
      time: markDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      timestamp: markDate.getTime()
    });
  });

  notificationsList.slice(0, 5).forEach((n: any) => {
    const nDate = new Date(n.createdAt || new Date());
    activities.push({
      icon: Megaphone,
      tint: "bg-violet-100 text-violet-600",
      title: n.title,
      time: nDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      timestamp: nDate.getTime()
    });
  });

  const liveActivities = activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  const liveTrend = buildMonthlyAttendanceTrend(recentLogs);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner with child selector */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 cc-welcome-banner border border-primary/10">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight">
              Welcome, {parentName}! <span>👋</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Here's the latest overview of your child's progress.</p>
          </div>
          {childrenList.length > 1 ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Select Child</span>
                <select
                  value={selectedChildIndex}
                  onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                  className="bg-transparent border-none font-bold text-sm focus:outline-none focus:ring-0 cursor-pointer p-0 text-foreground"
                >
                  {childrenList.map((c: any, index: number) => (
                    <option key={c._id} value={index} className="bg-card text-foreground">
                      {c.userId?.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {childData?.branch} · {childData?.rollNumber}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-soft">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Selected Child</div>
              <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm">{initials}</div>
              <div className="leading-tight">
                <div className="font-bold text-sm">{childName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {childBranch ? `${childBranch} · ` : ""}
                  {childYear ? `${childYear} ` : ""}
                  {childSection ? `(${childSection}) · ` : ""}
                  {childRoll}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widgets loading indicator */}
      {widgetsLoading && (
        <div className="flex items-center gap-2 text-sm text-primary font-semibold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" /> Fetching live metrics...
        </div>
      )}

      {/* 4 overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value={totalClasses > 0 ? `${overallAttendance}%` : "No attendance recorded yet"} tint="emerald" sub={totalClasses > 0 ? `Present ${attended} / ${totalClasses}` : "—"} to="/parent/attendance" />
        <StatCard icon={GraduationCap} label="Overall Marks (Sem)" value={overallMarksPercentage} tint="blue" sub={`Average score across ${liveMarks.length} subjects`} to="/parent/performance" />
        <StatCard icon={DollarSign} label="Pending Fees" value={`₹${pendingFeesTotal.toLocaleString()}`} tint="amber" sub={nearestInvoice ? `Due ${nearestDueDate}` : "All fees paid"} to="/parent/fees" />
        <StatCard icon={Megaphone} label="Announcements" value={`${unreadAnnouncementsCount} New`} tint="violet" sub="Important updates" to="/parent/notifications" />
      </div>

      {/* Attendance + Subject perf + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-4">Attendance Overview (This Month)</h2>
          {totalClasses === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground text-center">
              <span>No attendance recorded yet</span>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.94 0.02 285)" strokeWidth="3.4" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.65 0.16 150)" strokeWidth="3.4"
                    strokeDasharray={`${overallAttendance},100`} strokeLinecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.62 0.22 25)" strokeWidth="3.4"
                    strokeDasharray={`${latePercentage},100`} strokeDashoffset={`-${overallAttendance}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-extrabold">{overallAttendance}%</div>
                  <div className="text-[10px] text-muted-foreground">Overall</div>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <Row dot="bg-emerald-500" label="Present" value={`${attended} Days (${overallAttendance}%)`} />
                <Row dot="bg-rose-500" label="Absent" value={`${absent} Days (${absentPercentage}%)`} />
                <Row dot="bg-amber-500" label="Late" value={`${late} Days (${latePercentage}%)`} />
              </div>
            </div>
          )}
          <Link to="/parent/attendance" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">View Monthly Attendance <ArrowRight className="w-3.5 h-3.5" /></Link>
        </Card>

        <Card className="lg:col-span-2 p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-4">Subject-wise Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-[11px] uppercase tracking-wide">
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Internal /40</th>
                <th className="pb-3 font-semibold">External /60</th>
                <th className="pb-3 font-semibold">Total /100</th>
                <th className="pb-3 font-semibold">%</th>
                <th className="pb-3 font-semibold">Grade</th>
              </tr></thead>
              <tbody>
                {liveMarks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No grades published yet for this semester.
                    </td>
                  </tr>
                ) : (
                  liveMarks.map(m => {
                    const pct = m.total;
                    const pctColor = pct >= 80 ? "text-emerald-600" : pct >= 70 ? "text-blue-600" : pct >= 60 ? "text-amber-600" : "text-rose-600";
                    const gradeBg = m.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" :
                      m.grade.startsWith("B") ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
                    return (
                      <tr key={m.code} className="border-t border-border">
                        <td className="py-3 font-medium">{m.name}</td>
                        <td>{m.internal}</td>
                        <td>{m.external}</td>
                        <td className="font-semibold">{m.total}</td>
                        <td className={`font-bold ${pctColor}`}>{pct}%</td>
                        <td><span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${gradeBg}`}>{m.grade}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Link to="/parent/performance" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">View Detailed Marks Report <ArrowRight className="w-3.5 h-3.5" /></Link>
        </Card>
      </div>

      {/* Performance trend + Recent activities + Quick links */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-2">Attendance Monthly Trend</h2>
          <div className="h-48">
            {liveTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No trend data available</div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={liveTrend} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
                  <defs><linearGradient id="pt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0.25} /><stop offset="100%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                  <XAxis dataKey="month" stroke="oklch(0.50 0.03 270)" fontSize={11} />
                  <YAxis stroke="oklch(0.50 0.03 270)" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 3, fill: "oklch(0.52 0.21 285)" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Recent Activities</h2>
          {liveActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No recent activities.</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {liveActivities.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.tint}`}><a.icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Quick Links</h2>
          <div className="space-y-2">
            {[
              { to: "/parent/attendance", icon: CalendarCheck, title: "View Attendance", sub: "Subject-wise monthly view" },
              { to: "/parent/performance", icon: GraduationCap, title: "Academic Performance", sub: "Marks & analytics" },
              { to: "/parent/fees", icon: DollarSign, title: "Pay Fees", sub: "Secure payment gateway" },
              { to: "/parent/chatbot", icon: Bot, title: "Contact Faculty / AI", sub: "Quick assistance" },
            ].map(q => (
              <Link key={q.to} to={q.to as any} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"><q.icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{q.title}</div>
                  <div className="text-[11px] text-muted-foreground">{q.sub}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming events */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Upcoming Events & Exams</h2>
          <Link to="/parent/notifications" className="text-sm font-semibold text-primary">View All</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {events.map((e, i) => {
            const tints = ["from-violet-50 to-violet-100/40", "from-rose-50 to-rose-100/40", "from-amber-50 to-amber-100/40", "from-emerald-50 to-emerald-100/40"];
            return (
              <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br border border-border ${tints[i % 4]} dark:from-card dark:to-card`}>
                <div className="text-[10px] uppercase tracking-wide font-bold text-primary">{e.category}</div>
                <div className="text-sm font-semibold mt-1">{e.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {e.date}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-400/30 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-100">
        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">i</div>
        <span><strong>Note:</strong> Minimum 75% attendance is required to appear for university examinations.</span>
      </div>
    </div>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${dot}`} /> {label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
