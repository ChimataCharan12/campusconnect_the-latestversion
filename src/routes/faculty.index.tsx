import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/AppShell";
import {
  Users, Calendar, ClipboardCheck, MessageSquare, Upload, GraduationCap,
  UserCog, ArrowRight, FileText, CheckCircle2, ClipboardList, Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

export const Route = createFileRoute("/faculty/")({ component: Page });

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const dateStr = date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr = date.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-7">
      {/* Welcome banner */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "Faculty"}! <span aria-hidden>👋</span>
          </h1>
          <p className="text-muted-foreground text-[14.5px] mt-1.5">Here's an overview of your activities.</p>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-soft hover:bg-accent transition-colors cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200/80 dark:from-violet-500/20 dark:to-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center ring-1 ring-violet-200/60 dark:ring-violet-400/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="leading-tight text-left">
                <div className="text-[15px] font-extrabold tracking-tight">{dateStr}</div>
                <div className="text-xs text-muted-foreground font-medium">{dayStr}</div>
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
                  navigate({ to: "/faculty/timetable" });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Users} label="Total Students" value="120" tint="violet" to="/faculty/students" cta="View All" />
        <StatTile icon={Calendar} label="Classes Today" value="18" tint="emerald" to="/faculty/timetable" cta="View Schedule" />
        <StatTile icon={ClipboardCheck} label="Pending Tasks" value="6" tint="amber" to="/faculty/assignments" cta="View Tasks" />
        <StatTile icon={MessageSquare} label="Messages" value="3" tint="blue" to="/faculty/notifications" cta="View Messages" />
      </div>

      {/* Big action cards */}
      <div className="grid lg:grid-cols-3 gap-5">
        <ActionCard
          icon={Upload} accent={ClipboardList}
          title="Upload Attendance"
          desc="Upload and manage student attendance"
          steps={["Select class and date", "Mark present / absent", "Submit attendance"]}
          to="/faculty/attendance" cta="Upload Attendance" color="emerald"
        />
        <ActionCard
          icon={FileText} accent={Award}
          title="Enter Marks"
          desc="Enter and manage student marks"
          steps={["Select class and subject", "Enter internal / external marks", "Submit and publish marks"]}
          to="/faculty/marks" cta="Enter Marks" color="blue"
        />
        <ActionCard
          icon={UserCog} accent={Users}
          title="Student Management"
          desc="View and manage student information"
          steps={["View student list", "Update student details", "Monitor academic progress"]}
          to="/faculty/management" cta="Manage Students" color="violet"
        />
      </div>

      {/* Recent activities */}
      <Card className="p-6 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg tracking-tight">Recent Activities</h3>
          <Link to={"/faculty/notifications" as any} className="text-sm font-semibold text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-border">
          {[
            { i: CheckCircle2, t: "Attendance uploaded for CSE 3rd Year - Data Structures", time: "2 hours ago", c: "emerald" },
            { i: FileText, t: "Internal marks entered for CSE 2nd Year - DBMS", time: "5 hours ago", c: "blue" },
            { i: Users, t: "Updated details for 5 students", time: "1 day ago", c: "violet" },
            { i: GraduationCap, t: "Published Internal Test 2 marks for Computer Networks", time: "2 days ago", c: "amber" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tintBg(a.c)}`}>
                <a.i className={`w-[18px] h-[18px] ${tintText(a.c)}`} />
              </div>
              <div className="flex-1 min-w-0 text-[14px] font-medium">{a.t}</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tint, to, cta }: { icon: any; label: string; value: string; tint: string; to: string; cta: string }) {
  const map: Record<string, { surface: string; icon: string; ring: string; text: string }> = {
    violet:  { surface: "bg-gradient-to-br from-violet-50 to-white dark:from-violet-500/15 dark:to-card",   icon: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",   ring: "border-violet-200/60 dark:border-violet-400/15",   text: "text-violet-600 dark:text-violet-300" },
    emerald: { surface: "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/15 dark:to-card", icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300", ring: "border-emerald-200/60 dark:border-emerald-400/15", text: "text-emerald-600 dark:text-emerald-300" },
    amber:   { surface: "bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/15 dark:to-card",     icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",       ring: "border-amber-200/60 dark:border-amber-400/15",     text: "text-amber-600 dark:text-amber-300" },
    blue:    { surface: "bg-gradient-to-br from-sky-50 to-white dark:from-sky-500/15 dark:to-card",         icon: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",               ring: "border-sky-200/60 dark:border-sky-400/15",         text: "text-sky-600 dark:text-sky-300" },
  };
  const t = map[tint] ?? map.violet;
  return (
    <Link to={to as any} className={`group relative rounded-2xl p-5 border ${t.ring} ${t.surface} shadow-soft hover:-translate-y-0.5 hover:shadow-premium transition-all block`}>
      <div className="flex items-center gap-4">
        <div className={`w-[52px] h-[52px] rounded-2xl ${t.icon} flex items-center justify-center shadow-sm`}>
          <Icon className="w-[26px] h-[26px]" strokeWidth={2.1} />
        </div>
        <div className="min-w-0">
          <div className="text-[28px] font-extrabold tracking-tight leading-none">{value}</div>
          <div className="text-[13px] text-muted-foreground mt-1.5 font-medium">{label}</div>
        </div>
      </div>
      <div className={`mt-3.5 flex items-center justify-between text-[12.5px] font-bold ${t.text}`}>
        {cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ActionCard({ icon: Icon, accent: Accent, title, desc, steps, to, cta, color }: any) {
  const confMap: Record<string, { surface: string; iconGrad: string; iconShadow: string; titleText: string; check: string; btn: string; btnShadow: string; watermark: string }> = {
    emerald: {
      surface: "bg-gradient-to-br from-emerald-50/90 via-emerald-50/30 to-card dark:from-emerald-500/15 dark:via-emerald-500/5 dark:to-card border-emerald-200/60 dark:border-emerald-400/20",
      iconGrad: "from-emerald-500 to-teal-600",
      iconShadow: "shadow-[0_12px_28px_-10px_rgba(16,185,129,0.55)]",
      titleText: "text-emerald-600 dark:text-emerald-300",
      check: "text-emerald-600 dark:text-emerald-300",
      btn: "from-emerald-500 to-teal-600",
      btnShadow: "shadow-[0_10px_24px_-10px_rgba(16,185,129,0.65)] hover:shadow-[0_14px_30px_-10px_rgba(16,185,129,0.75)]",
      watermark: "text-emerald-500/15 dark:text-emerald-300/10",
    },
    blue: {
      surface: "bg-gradient-to-br from-sky-50/90 via-sky-50/30 to-card dark:from-sky-500/15 dark:via-sky-500/5 dark:to-card border-sky-200/60 dark:border-sky-400/20",
      iconGrad: "from-sky-500 to-blue-600",
      iconShadow: "shadow-[0_12px_28px_-10px_rgba(59,130,246,0.55)]",
      titleText: "text-sky-600 dark:text-sky-300",
      check: "text-sky-600 dark:text-sky-300",
      btn: "from-sky-500 to-blue-600",
      btnShadow: "shadow-[0_10px_24px_-10px_rgba(59,130,246,0.65)] hover:shadow-[0_14px_30px_-10px_rgba(59,130,246,0.75)]",
      watermark: "text-sky-500/15 dark:text-sky-300/10",
    },
    violet: {
      surface: "bg-gradient-to-br from-violet-50/90 via-violet-50/30 to-card dark:from-violet-500/15 dark:via-violet-500/5 dark:to-card border-violet-200/60 dark:border-violet-400/20",
      iconGrad: "from-violet-500 to-purple-600",
      iconShadow: "shadow-[0_12px_28px_-10px_rgba(139,92,246,0.55)]",
      titleText: "text-violet-600 dark:text-violet-300",
      check: "text-violet-600 dark:text-violet-300",
      btn: "from-violet-500 to-purple-600",
      btnShadow: "shadow-[0_10px_24px_-10px_rgba(139,92,246,0.65)] hover:shadow-[0_14px_30px_-10px_rgba(139,92,246,0.75)]",
      watermark: "text-violet-500/15 dark:text-violet-300/10",
    },
  };
  const conf = confMap[color as string] ?? confMap.violet;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border ${conf.surface} shadow-premium transition-all`}>
      {/* Decorative watermark illustration */}
      <Accent aria-hidden className={`absolute -right-3 -top-3 w-32 h-32 ${conf.watermark} rotate-[-8deg] pointer-events-none`} strokeWidth={1.4} />

      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${conf.iconGrad} ${conf.iconShadow} text-white flex items-center justify-center`}>
        <Icon className="w-7 h-7" strokeWidth={2.2} />
      </div>
      <h3 className={`relative mt-4 text-[22px] font-extrabold tracking-tight ${conf.titleText}`}>{title}</h3>
      <p className="relative text-[13.5px] text-muted-foreground mt-1.5 max-w-[230px]">{desc}</p>
      <ul className="relative mt-4 space-y-2 text-[13.5px]">
        {steps.map((s: string) => (
          <li key={s} className="flex items-center gap-2.5">
            <CheckCircle2 className={`w-[18px] h-[18px] shrink-0 ${conf.check}`} strokeWidth={2.2} />
            <span className="text-foreground/85 font-medium">{s}</span>
          </li>
        ))}
      </ul>
      <Link
        to={to as any}
        className={`relative mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r ${conf.btn} text-white text-[14px] font-bold transition-shadow ${conf.btnShadow}`}
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function tintText(t: string) {
  return {
    violet: "text-violet-600 dark:text-violet-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    blue: "text-sky-600 dark:text-sky-300",
  }[t] || "text-primary";
}
function tintBg(t: string) {
  return {
    violet: "bg-violet-100 dark:bg-violet-500/15",
    emerald: "bg-emerald-100 dark:bg-emerald-500/15",
    amber: "bg-amber-100 dark:bg-amber-500/15",
    blue: "bg-sky-100 dark:bg-sky-500/15",
  }[t] || "bg-primary/10";
}
