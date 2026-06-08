import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, StatCard } from "@/components/AppShell";
import {
  CalendarCheck, GraduationCap, ClipboardList, Bell, ArrowRight, BookOpen, Megaphone,
  Calendar as CalendarIcon, DollarSign, Phone, Eye, FileText, Bot,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { performanceTrend, marks, announcements, events } from "@/lib/mock";

export const Route = createFileRoute("/parent/")({ component: Page });

const child = {
  name: "Ananya Sharma",
  roll: "23CSE045",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  section: "A",
  semester: "Semester 6",
};

function Page() {
  return (
    <div className="space-y-6">
      {/* Welcome banner with child selector */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 cc-welcome-banner border border-primary/10">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight">
              Welcome, Rajesh Sharma! <span>👋</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Here's the latest overview of your child's progress.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-soft">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Selected Child</div>
            <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm">AS</div>
            <div className="leading-tight">
              <div className="font-bold text-sm">{child.name}</div>
              <div className="text-[11px] text-muted-foreground">CSE · {child.year} ({child.section}) · {child.roll}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Overall Attendance" value="82%" tint="emerald" sub="Good · Present 98 / 120" to="/parent/attendance" />
        <StatCard icon={GraduationCap} label="Overall Marks (Sem)" value="78.35%" tint="blue" sub="Rank 5 / 60 · Good" to="/parent/performance" />
        <StatCard icon={DollarSign} label="Pending Fees" value="₹8,500" tint="amber" sub="Due 10 Jun 2025" to="/parent/fees" />
        <StatCard icon={Megaphone} label="Announcements" value="2 New" tint="violet" sub="Important updates" to="/parent/notifications" />
      </div>

      {/* Attendance + Subject perf + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-4">Attendance Overview (This Month)</h2>
          <div className="flex items-center gap-5">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.94 0.02 285)" strokeWidth="3.4" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.65 0.16 150)" strokeWidth="3.4"
                  strokeDasharray="82,100" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.62 0.22 25)" strokeWidth="3.4"
                  strokeDasharray="12,100" strokeDashoffset="-82" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-extrabold">82%</div>
                <div className="text-[10px] text-muted-foreground">Overall</div>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <Row dot="bg-emerald-500" label="Present" value="16 Days (82%)" />
              <Row dot="bg-rose-500" label="Absent" value="3 Days (15%)" />
              <Row dot="bg-amber-500" label="Late" value="1 Day (3%)" />
            </div>
          </div>
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
                {marks.map(m => {
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
                })}
              </tbody>
            </table>
          </div>
          <Link to="/parent/performance" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">View Detailed Marks Report <ArrowRight className="w-3.5 h-3.5" /></Link>
        </Card>
      </div>

      {/* Performance trend + Recent activities + Quick links */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-2">Performance Trend</h2>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={performanceTrend} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
                <defs><linearGradient id="pt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0.25} /><stop offset="100%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                <XAxis dataKey="month" stroke="oklch(0.50 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.50 0.03 270)" fontSize={11} domain={[60, 90]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 3, fill: "oklch(0.52 0.21 285)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Recent Activities</h2>
          <ul className="space-y-3 text-sm">
            {[
              { icon: CalendarCheck, tint: "bg-emerald-100 text-emerald-600", title: "Attendance marked for 20 May 2025", time: "Today, 09:30 AM" },
              { icon: GraduationCap, tint: "bg-amber-100 text-amber-600", title: "Marks uploaded – Data Structures", time: "19 May, 08:15 PM" },
              { icon: Megaphone, tint: "bg-violet-100 text-violet-600", title: "New announcement published", time: "18 May, 11:20 AM" },
              { icon: FileText, tint: "bg-blue-100 text-blue-600", title: "Assignment uploaded – DBMS", time: "17 May, 04:45 PM" },
            ].map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.tint}`}><a.icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
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
