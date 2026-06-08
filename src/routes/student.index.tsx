import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/AppShell";
import {
  CalendarCheck, FileText, Bot, MapPin, ArrowRight, Megaphone,
  GraduationCap, Calendar as CalendarIcon, Bell, ClipboardList,
} from "lucide-react";
import { announcements, todaysClasses, events, attendanceTrend } from "@/lib/mock";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth";
import campusBanner from "@/assets/campus-banner.png";

export const Route = createFileRoute("/student/")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const first = user?.name?.split(" ")[0] ?? "Student";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl px-6 sm:px-8 lg:px-10 py-8 sm:py-10 cc-welcome-banner border border-primary/10">
        <div className="relative max-w-md z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-[1.15] text-foreground">
            Welcome back,<br/>{first}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">Here's what's happening on campus.</p>
        </div>
        <img
          src={campusBanner}
          alt="Campus building"
          className="hidden sm:block absolute right-2 sm:right-6 lg:right-10 bottom-0 h-[150px] sm:h-[180px] lg:h-[230px] w-auto object-contain object-bottom select-none pointer-events-none"
          loading="lazy"
        />
      </div>


      {/* 4 summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <SummaryCard
          accent="emerald"
          title="Attendance"
          to="/student/attendance"
          icon={CalendarCheck}
        >
          <div className="text-center mt-3">
            <div className="text-[40px] leading-none font-extrabold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">82%</div>
            <div className="text-xs text-muted-foreground mt-1">Overall Attendance</div>
          </div>
          <div className="h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-glow-emerald" style={{ width: "82%" }} />
          </div>
          <div className="grid grid-cols-3 text-center text-[11px] mt-3 divide-x divide-emerald-200/60 dark:divide-emerald-900/40">
            <div className="px-1"><div className="text-emerald-600 dark:text-emerald-300 font-bold text-sm">82%</div><div className="text-muted-foreground">Present</div></div>
            <div className="px-1"><div className="text-rose-600 dark:text-rose-300 font-bold text-sm">12%</div><div className="text-muted-foreground">Absent</div></div>
            <div className="px-1"><div className="font-bold text-sm">120</div><div className="text-muted-foreground">Total</div></div>
          </div>
        </SummaryCard>

        <SummaryCard
          accent="blue"
          title="Marks"
          to="/student/marks"
          icon={FileText}
        >
          <div className="text-center mt-3">
            <div className="text-[40px] leading-none font-extrabold bg-gradient-to-br from-sky-600 to-blue-600 bg-clip-text text-transparent">8.4</div>
            <div className="text-xs text-muted-foreground mt-1">SGPA · Semester Performance</div>
          </div>
          <div className="h-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 shadow-glow-blue" style={{ width: "84%" }} />
          </div>
          <div className="grid grid-cols-3 text-center text-[11px] mt-3 divide-x divide-blue-200/60 dark:divide-blue-900/40">
            <div className="px-1"><div className="text-blue-600 dark:text-blue-300 font-bold text-sm">85%</div><div className="text-muted-foreground">Internal</div></div>
            <div className="px-1"><div className="text-blue-600 dark:text-blue-300 font-bold text-sm">78%</div><div className="text-muted-foreground">External</div></div>
            <div className="px-1"><div className="font-bold text-sm">1630</div><div className="text-muted-foreground">/2000</div></div>
          </div>
        </SummaryCard>

        <SummaryCard
          accent="violet"
          title="AI Chatbot"
          to="/student/chatbot"
          icon={Bot}
          cta="Open Chatbot"
        >
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Ask your doubts, get information and instant support from our AI assistant.
          </p>
        </SummaryCard>

        <SummaryCard
          accent="orange"
          title="Campus Navigation"
          to="/student/navigation"
          icon={MapPin}
          cta="Open Navigation"
        >
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Find departments, blocks, facilities and important locations on campus.
          </p>
        </SummaryCard>
      </div>

      {/* Recent notifications */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Recent Notifications</h2>
          </div>
          <Link to="/student/notifications" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {[
            { icon: Megaphone, tint: "violet", title: "Internal marks for Data Structures have been published.", time: "2 hours ago" },
            { icon: CalendarCheck, tint: "emerald", title: "Attendance for this week is updated.", time: "1 day ago" },
            { icon: FileText, tint: "blue", title: "Campus placement drive on 25th May. Register now!", time: "2 days ago" },
            { icon: CalendarIcon, tint: "amber", title: "TechFest 2K25 registrations are open. Participate and win exciting prizes!", time: "3 days ago" },
          ].map((n, i) => {
            const tints: Record<string, string> = {
              violet: "bg-violet-100 text-violet-600",
              emerald: "bg-emerald-100 text-emerald-600",
              blue: "bg-blue-100 text-blue-600",
              amber: "bg-amber-100 text-amber-600",
            };
            return (
              <li key={i} className="flex items-start sm:items-center gap-3 py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tints[n.tint]}`}>
                  <n.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-sm">{n.title}</div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:block">{n.time}</div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Today's classes + Upcoming events */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Today's Classes</h2>
            </div>
            <Link to="/student/timetable" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
              View timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {todaysClasses.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${i % 2 ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-sm">{c.subject}</div>
                    {c.live && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">ONGOING</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.time} · Room {c.room} · {c.faculty}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Upcoming Events</h2>
            <Link to="/student/notifications" className="text-sm font-semibold text-primary">View All</Link>
          </div>
          <div className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="p-3 rounded-xl border border-border">
                <div className="text-[10px] tracking-wide text-primary font-bold uppercase">{e.category}</div>
                <div className="font-semibold text-sm mt-0.5">{e.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{e.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance snapshot */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Attendance Trend</h2>
          </div>
          <span className="text-xs text-muted-foreground">Last 6 weeks</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
              <XAxis dataKey="week" stroke="oklch(0.50 0.03 270)" fontSize={12} />
              <YAxis stroke="oklch(0.50 0.03 270)" fontSize={12} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 285)" }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.52 0.21 285)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent announcements (small) */}
      <Card className="p-5 sm:p-6">
        <h2 className="font-bold text-lg mb-4">Latest Announcements</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {announcements.map((a, i) => {
            const tints = [
              "from-violet-50 to-violet-100/40 text-violet-700",
              "from-rose-50 to-rose-100/40 text-rose-700",
              "from-amber-50 to-amber-100/40 text-amber-700",
              "from-emerald-50 to-emerald-100/40 text-emerald-700",
            ];
            return (
              <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br border border-border ${tints[i % 4]}`}>
                <div className="text-[10px] uppercase tracking-wide font-bold opacity-70">{a.type}</div>
                <div className="text-sm font-semibold mt-1 text-foreground">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.date}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({
  accent, title, to, icon: Icon, cta, children,
}: {
  accent: "violet" | "emerald" | "blue" | "orange";
  title: string; to: string; icon: any; cta?: string; children: React.ReactNode;
}) {
  const palette: Record<string, { surface: string; text: string; cta: string; ring: string; iconBg: string; glow: string; orb: string }> = {
    emerald: {
      surface: "surface-emerald",
      text: "text-emerald-700 dark:text-emerald-300",
      cta: "btn-emerald",
      ring: "border-emerald-200/70 dark:border-emerald-400/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      glow: "shadow-glow-emerald",
      orb: "from-emerald-300/60 to-teal-300/0",
    },
    blue: {
      surface: "surface-blue",
      text: "text-blue-700 dark:text-blue-300",
      cta: "btn-blue",
      ring: "border-blue-200/70 dark:border-blue-400/20",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
      glow: "shadow-glow-blue",
      orb: "from-sky-300/60 to-blue-300/0",
    },
    violet: {
      surface: "surface-violet",
      text: "text-violet-700 dark:text-violet-300",
      cta: "btn-violet",
      ring: "border-violet-200/70 dark:border-violet-400/20",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      glow: "shadow-glow-violet",
      orb: "from-violet-300/60 to-purple-300/0",
    },
    orange: {
      surface: "surface-orange",
      text: "text-orange-600 dark:text-orange-300",
      cta: "btn-orange",
      ring: "border-orange-200/70 dark:border-orange-400/20",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
      glow: "shadow-glow-orange",
      orb: "from-orange-300/60 to-amber-300/0",
    },
  };
  const p = palette[accent];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${p.ring} ${p.surface} p-5 shadow-soft hover:-translate-y-0.5 hover:shadow-premium transition-all flex flex-col`}>
      <Link to={to as any} className="absolute inset-0 z-0" aria-label={cta ?? `Open ${title}`} />
      <div className={`pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${p.orb} blur-2xl opacity-70`} aria-hidden />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-11 h-11 rounded-xl ${p.iconBg} text-white flex items-center justify-center ${p.glow}`}>
            <Icon className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className={`font-bold text-[15px] ${p.text}`}>{title}</div>
        </div>
      </div>

      <div className="relative z-10 flex-1 pointer-events-none">{children}</div>

      <Link
        to={to as any}
        className={`relative z-10 mt-4 inline-flex items-center justify-between gap-2 h-11 px-4 rounded-xl text-sm font-semibold text-white shadow-soft hover:shadow-md transition-all ${p.cta}`}
      >
        <span>{cta ?? "View Details"}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

