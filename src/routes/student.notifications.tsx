import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Bell, Pin, BookOpen, CalendarCheck, GraduationCap, ClipboardList } from "lucide-react";
import { notifications } from "@/lib/mock";
import { useState } from "react";

export const Route = createFileRoute("/student/notifications")({ component: Page });

const catIcon: Record<string, any> = { Academic: BookOpen, Attendance: CalendarCheck, Marks: GraduationCap, Assignments: ClipboardList, Events: Bell };
const cats = ["All", "Academic", "Attendance", "Marks", "Assignments", "Events"];

function Page() {
  const [cat, setCat] = useState("All");
  const items = cat === "All" ? notifications : notifications.filter(n => n.category === cat);
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Stay updated with the latest from your campus." />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${cat === c ? "bg-primary text-white" : "bg-card border border-border"}`}>{c}</button>
        ))}
      </div>
      <Card className="p-3">
        <div className="px-3 py-2 mb-1 flex items-center gap-2 text-xs text-primary font-semibold uppercase"><Pin className="w-3 h-3" /> Pinned</div>
        <div className="px-3 py-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
          <div className="font-medium text-sm">📢 Mid Semester Exam Schedule Released</div>
          <div className="text-xs text-muted-foreground">Check the exams portal for detailed timetable. Starts 20 May.</div>
        </div>
        <div className="space-y-1">
          {items.map((n, i) => {
            const Icon = catIcon[n.category] ?? Bell;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${!n.read ? "bg-muted/40" : ""}`}>
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
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
