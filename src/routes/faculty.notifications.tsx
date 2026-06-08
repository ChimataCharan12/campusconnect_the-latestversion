import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Bell, Pin, BookOpen, CalendarCheck, GraduationCap, ClipboardList, Megaphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faculty/notifications")({ component: Page });

const cats = ["All", "Academic", "Attendance", "Marks", "Assignments", "Announcements"];
const catIcon: Record<string, any> = { Academic: BookOpen, Attendance: CalendarCheck, Marks: GraduationCap, Assignments: ClipboardList, Announcements: Megaphone };

const items = [
  { title: "Reminder: Submit Internal Test 2 marks by Friday", time: "2 hours ago", category: "Marks", read: false },
  { title: "5 students applied for leave on 23 May", time: "4 hours ago", category: "Attendance", read: false },
  { title: "HOD requested syllabus completion report", time: "Yesterday", category: "Academic", read: false },
  { title: "New assignment submissions in DBMS (Lab 4)", time: "Yesterday", category: "Assignments", read: false },
  { title: "Faculty meeting on 25 May, 3:00 PM, Conference Hall", time: "2 days ago", category: "Announcements", read: false },
  { title: "Internal Test 2 schedule released", time: "3 days ago", category: "Academic", read: true },
  { title: "Attendance below 75% flagged for 8 students", time: "4 days ago", category: "Attendance", read: true },
];

function Page() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? items : items.filter(n => n.category === cat);
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Stay updated with your teaching activities and campus announcements." />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${cat === c ? "bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white shadow-soft" : "bg-card border border-border hover:bg-muted"}`}>{c}</button>
        ))}
      </div>
      <Card className="p-3">
        <div className="px-3 py-2 mb-1 flex items-center gap-2 text-xs text-primary font-semibold uppercase"><Pin className="w-3 h-3" /> Pinned</div>
        <div className="px-3 py-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
          <div className="font-medium text-sm">📢 End-of-semester grade submission deadline: 30 May 2025</div>
          <div className="text-xs text-muted-foreground">Please ensure all internal and external marks are published before the deadline.</div>
        </div>
        <div className="space-y-1">
          {list.map((n, i) => {
            const Icon = catIcon[n.category] ?? Bell;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${!n.read ? "bg-muted/40" : "hover:bg-muted/30"}`}>
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">{n.title}</div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{n.category} · {n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
