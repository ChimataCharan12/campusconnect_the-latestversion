import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Bell, CalendarCheck, GraduationCap, ClipboardList, DollarSign, Megaphone, CheckCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/parent/notifications")({ component: Page });

const data = [
  { icon: GraduationCap, tint: "violet", cat: "Academic", title: "Internal marks for Data Structures published", time: "2 hours ago", unread: true },
  { icon: CalendarCheck, tint: "emerald", cat: "Attendance", title: "Attendance updated for this week — your child has 82% overall", time: "1 day ago", unread: true },
  { icon: ClipboardList, tint: "blue", cat: "Assignments", title: "DBMS Assignment 2 has been graded — Grade: A", time: "2 days ago", unread: true },
  { icon: DollarSign, tint: "amber", cat: "Fees", title: "Pending fees ₹8,500 due on 10 Jun 2025", time: "3 days ago", unread: false },
  { icon: Megaphone, tint: "rose", cat: "Announcements", title: "Parent-Teacher meeting scheduled for 28 May 2025", time: "5 days ago", unread: false },
];

const tints: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

function Page() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Academic", "Attendance", "Assignments", "Fees", "Announcements"];
  const filtered = filter === "All" ? data : data.filter(d => d.cat === filter);
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Stay updated with academic alerts, fees and announcements."
        action={<button className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5"><CheckCheck className="w-4 h-4" /> Mark all as read</button>} />

      <div className="flex gap-2 overflow-x-auto">
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${filter === c ? "gradient-primary text-white shadow-soft" : "bg-muted text-foreground/70 hover:bg-muted/80"}`}>{c}</button>
        ))}
      </div>

      <Card className="divide-y divide-border">
        {filtered.map((n, i) => (
          <div key={i} className={`flex items-start gap-4 p-5 hover:bg-muted/40 transition-colors ${n.unread ? "bg-primary/[0.03]" : ""}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tints[n.tint]}`}><n.icon className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wide font-bold text-primary">{n.cat}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="font-semibold text-sm mt-1">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Bell className="w-3 h-3" /> {n.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
