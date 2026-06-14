import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, Legend, QuickActionTile, StatusPill } from "@/components/admin-ui";
import {
  Users, GraduationCap, Users2, CalendarCheck, FileText, Megaphone, Calendar,
  BookOpen, Building2, Bell, Activity, UserPlus, Send, BarChart3, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, BarChart, Bar, CartesianGrid,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

const trend = Array.from({ length: 7 }).map((_, i) => ({
  d: ["24 May", "25 May", "26 May", "27 May", "28 May", "29 May", "30 May"][i],
  v: [88, 90, 89, 91, 90, 91, 92.45][i],
}));

const marksBars = [
  { d: "CSE", v: 88 }, { d: "IT", v: 82 }, { d: "ME", v: 78 },
  { d: "EC", v: 74 }, { d: "CE", v: 70 }, { d: "Others", v: 65 },
];

const deptDonut = [
  { label: "Computer Science (26.53%)", value: 650, color: "#7c3aed" },
  { label: "Information Tech (21.22%)",  value: 520, color: "#06b6d4" },
  { label: "Mechanical (18.37%)",        value: 450, color: "#f59e0b" },
  { label: "Electronics (17.14%)",       value: 420, color: "#ef4444" },
  { label: "Civil (10.20%)",             value: 250, color: "#10b981" },
  { label: "Others (6.53%)",             value: 160, color: "#8b5cf6" },
];

const announcements = [
  { icon: Megaphone, tint: "bg-violet-500", title: "Annual Sports Meet 2026", desc: "Sports event will be held from 10th June to 15th June.", time: "2 hours ago" },
  { icon: BookOpen, tint: "bg-rose-500", title: "Semester Break", desc: "College will remain closed from 1st June to 5th June.", time: "5 hours ago" },
  { icon: FileText, tint: "bg-amber-500", title: "Internal Exam Schedule", desc: "Internal examinations start from 8th June 2026.", time: "1 day ago" },
  { icon: Building2, tint: "bg-sky-500", title: "Library Timings Updated", desc: "New library timings are now in effect from this week.", time: "2 days ago" },
];

const activity = [
  { tone: "info", text: "New student Ananya Sharma added", time: "10 mins ago" },
  { tone: "success", text: "Faculty Dr. Rohit Verma updated marks", time: "30 mins ago" },
  { tone: "warning", text: "Attendance uploaded by Priya Nair (CSE)", time: "1 hour ago" },
  { tone: "info", text: "New announcement published", time: "2 hours ago" },
  { tone: "muted", text: "Timetable updated for IT Department", time: "3 hours ago" },
];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date(2026, 4, 30));
  const [open, setOpen] = useState(false);
  const name = user?.name ?? "Admin";
  const dateStr = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const dayStr = date.toLocaleDateString("en-US", { weekday: "long" });

  const token = user?.token;
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.metrics) {
          setMetrics(res.data.metrics);
        }
      })
      .catch((err) => console.error("Error fetching admin metrics:", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name}! 👋`}
        subtitle="Here's what's happening in your campus today."
        action={
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl bg-card border border-border/70 px-3 py-2 shadow-soft hover:bg-accent transition-colors cursor-pointer">
                <Calendar className="w-4 h-4 text-primary" />
                <div className="leading-tight text-left">
                  <div className="text-[12px] font-bold">{dateStr}</div>
                  <div className="text-[10.5px] text-muted-foreground">{dayStr}</div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
              <CalendarPicker
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setOpen(false);
                    navigate({ to: "/admin/attendance" });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Users}         label="Total Students"          value={metrics?.totalStudents?.toLocaleString() ?? "0"}  tint="violet"  trend="Active students" />
        <MetricCard icon={GraduationCap} label="Total Faculty"           value={metrics?.totalFaculty?.toLocaleString() ?? "0"}    tint="emerald" trend="Active faculty" />
        <MetricCard icon={Users2}        label="Total Parents"           value={metrics?.totalParents?.toLocaleString() ?? "0"}  tint="blue"    trend="Active parents" />
        <MetricCard icon={CalendarCheck} label="Today's Attendance"      value={`${metrics?.todayAttendance ?? 0}%`} tint="amber"   trend="Today's snapshot" />
        <MetricCard icon={FileText}      label="Today's Marks Submitted" value={metrics?.totalMarks?.toLocaleString() ?? "0"}    tint="fuchsia" trend="Total marks uploaded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Attendance Overview" subtitle="Today" className="col-span-1">
          <div className="flex flex-col items-center gap-4">
            <Donut
              size={180}
              data={[
                { label: "Present", value: metrics?.attendanceOverview?.present ?? 0, color: "#10b981" },
                { label: "Absent",  value: metrics?.attendanceOverview?.absent ?? 0,  color: "#ef4444" },
                { label: "Late",    value: metrics?.attendanceOverview?.late ?? 0,   color: "#f59e0b" },
              ]}
              center={
                <>
                  <div className="text-[26px] font-extrabold">{metrics?.attendanceOverview?.overallPercentage ?? 0}%</div>
                  <div className="text-[11px] text-muted-foreground">Overall</div>
                </>
              }
            />
            <div className="w-full space-y-2 text-[12.5px]">
              {(() => {
                const present = metrics?.attendanceOverview?.present ?? 0;
                const absent = metrics?.attendanceOverview?.absent ?? 0;
                const late = metrics?.attendanceOverview?.late ?? 0;
                const total = present + absent + late;
                const getPct = (v: number) => total > 0 ? ((v / total) * 100).toFixed(2) : "0.00";
                return (
                  <>
                    <Row dot="#10b981" k="Present" v={`${present.toLocaleString()} (${getPct(present)}%)`} />
                    <Row dot="#ef4444" k="Absent" v={`${absent.toLocaleString()} (${getPct(absent)}%)`} />
                    <Row dot="#f59e0b" k="Late" v={`${late.toLocaleString()} (${getPct(late)}%)`} />
                  </>
                );
              })()}
            </div>
            <button onClick={() => navigate({ to: "/admin/attendance" })} className="w-full text-[12px] font-semibold text-primary hover:underline mt-1">View Full Report →</button>
          </div>
        </SectionCard>

        <SectionCard title="Attendance Trend" subtitle="Last 7 Days" className="col-span-1 lg:col-span-2">
          {(!metrics?.attendanceTrend || metrics.attendanceTrend.length === 0) ? (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
              No trend data available
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.attendanceTrend}>
                  <defs>
                    <linearGradient id="attG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#attG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Students by Department" action={<button onClick={() => navigate({ to: "/admin/students" })} className="text-[12px] font-semibold text-primary hover:underline">View Report →</button>}>
          {(!metrics?.studentsByDepartment || metrics.studentsByDepartment.length === 0) ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No department data available
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Donut size={170}
                data={metrics.studentsByDepartment}
                center={<><div className="text-xl font-extrabold">{metrics.totalStudents ?? 0}</div><div className="text-[10.5px] text-muted-foreground">Total</div></>}
              />
              <Legend items={metrics.studentsByDepartment.map((d: any) => ({ label: d.label, value: String(d.value), color: d.color }))} />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Marks Overview" subtitle="(This Semester)" action={<button onClick={() => navigate({ to: "/admin/reports" })} className="text-[12px] font-semibold text-primary hover:underline">View Report →</button>}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Mini label="Average Marks" value={`${metrics?.marksStats?.avg ?? 0}%`} tint="text-emerald-600" />
            <Mini label="Highest Marks" value={`${metrics?.marksStats?.max ?? 0}%`} tint="text-violet-600" />
            <Mini label="Lowest Marks" value={`${metrics?.marksStats?.min ?? 0}%`} tint="text-rose-600" />
            <Mini label="Pass Percentage" value={`${metrics?.marksStats?.passRate ?? 0}%`} tint="text-sky-600" />
          </div>
          {(!metrics?.marksBars || metrics.marksBars.length === 0) ? (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
              No marks data available
            </div>
          ) : (
            <div className="h-[160px]">
              <ResponsiveContainer>
                <BarChart data={metrics.marksBars}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="v" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick System Overview">
          <ul className="space-y-3 text-[13px]">
            {[
              { icon: Building2, label: "Total Departments", v: 8 },
              { icon: BookOpen,  label: "Total Courses",     v: 48 },
              { icon: FileText,  label: "Total Subjects",    v: 256 },
              { icon: Building2, label: "Total Classrooms",  v: 32 },
              { icon: Bell,      label: "Total Notifications Sent", v: 128 },
            ].map((r) => (
              <li key={r.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <r.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-foreground/80">{r.label}</div>
                <div className="font-bold">{r.v}</div>
              </li>
            ))}
          </ul>
          <a className="block mt-4 text-[12px] font-semibold text-primary">View System Report →</a>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Recent Announcements" action={<a className="text-[12px] font-semibold text-primary">View All →</a>} className="lg:col-span-1">
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li key={a.title} className="flex gap-3">
                <div className={`w-9 h-9 rounded-xl ${a.tint} text-white flex items-center justify-center shrink-0`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate">{a.title}</div>
                  <div className="text-[11.5px] text-muted-foreground leading-snug">{a.desc}</div>
                </div>
                <div className="text-[10.5px] text-muted-foreground whitespace-nowrap">{a.time}</div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="System Activity" action={<a className="text-[12px] font-semibold text-primary">View All →</a>} className="lg:col-span-1">
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <Activity className="w-4 h-4 mt-0.5 text-primary" />
                <div className="flex-1 text-[12.5px]">{a.text}</div>
                <div className="text-[10.5px] text-muted-foreground whitespace-nowrap">{a.time}</div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <QuickActionTile icon={UserPlus} label="Add Student" tint="violet" onClick={() => navigate({ to: "/admin/students" })} />
            <QuickActionTile icon={GraduationCap} label="Add Faculty" tint="emerald" onClick={() => navigate({ to: "/admin/faculty" })} />
            <QuickActionTile icon={Users2} label="Add Parent" tint="blue" onClick={() => navigate({ to: "/admin/parents" })} />
            <QuickActionTile icon={Send} label="Send Notice" tint="amber" onClick={() => navigate({ to: "/admin/notifications" })} />
            <QuickActionTile icon={BarChart3} label="View Reports" tint="fuchsia" onClick={() => navigate({ to: "/admin/reports" })} />
            <QuickActionTile icon={Calendar} label="Manage Schedule" tint="cyan" onClick={() => navigate({ to: "/admin/timetable" })} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ dot, k, v }: { dot: string; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
      <span className="flex-1">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function Mini({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-2.5">
      <div className="text-[10.5px] text-muted-foreground">{label}</div>
      <div className={`text-[15px] font-extrabold ${tint}`}>{value}</div>
    </div>
  );
}
