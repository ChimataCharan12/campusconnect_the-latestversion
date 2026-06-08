import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Megaphone, Plus, Calendar, Users, Pin, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

export const Route = createFileRoute("/faculty/announcements")({ component: Page });

const items = [
  { pinned: true, title: "Internal Test 2 Schedule Released", body: "Internal Test 2 begins on 28 May 2025. Check the timetable on the exams portal.", date: "20 May 2025", audience: "CSE 3rd Year - All Sections", tag: "Exam", color: "violet" },
  { pinned: false, title: "DBMS Lab 4 Submission Deadline Extended", body: "Submission deadline extended to 25 May 2025 due to system maintenance.", date: "18 May 2025", audience: "DBMS Students", tag: "Assignment", color: "emerald" },
  { pinned: false, title: "Guest Lecture: Advances in NoSQL", body: "Guest lecture by Dr. Anil Kumar (IIT Delhi) on 26 May, 2:00 PM, Auditorium A.", date: "16 May 2025", audience: "All CSE Students", tag: "Event", color: "blue" },
  { pinned: false, title: "Project Synopsis Review", body: "All 3rd year project teams must submit synopsis by 30 May for review.", date: "15 May 2025", audience: "Final Year Projects", tag: "Academic", color: "amber" },
];

const tagBg: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  blue: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
};

function Page() {
  const composeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const audienceRef = useRef<HTMLSelectElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const focusCompose = () => {
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => titleRef.current?.focus());
  };
  const publish = () => {
    const t = titleRef.current?.value.trim();
    const b = bodyRef.current?.value.trim();
    if (!t || !b) { toast.error("Title and message are required"); return; }
    toast.success(`Announcement published to ${audienceRef.current?.value}`);
    if (titleRef.current) titleRef.current.value = "";
    if (bodyRef.current) bodyRef.current.value = "";
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast notices and updates to your classes."
        action={
          <button onClick={focusCompose} className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)]">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        }
      />
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          {items.map((a, i) => (
            <Card key={i} className={`p-5 ${a.pinned ? "border-primary/30 bg-gradient-to-br from-violet-50/60 via-card to-card dark:from-violet-500/10" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tagBg[a.color]}`}><Megaphone className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                    <h3 className="font-bold">{a.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${tagBg[a.color]}`}>{a.tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {a.date}</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {a.audience}</span>
                  </div>
                </div>
                <button onClick={() => { if (titleRef.current) titleRef.current.value = `Re: ${a.title}`; if (bodyRef.current) bodyRef.current.value = a.body; focusCompose(); toast.success("Loaded into compose"); }} className="p-1.5 rounded-lg hover:bg-muted" title="Reply / re-broadcast"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5 h-fit" >
          <div ref={composeRef} />
          <h3 className="font-bold mb-3">Quick Compose</h3>
          <input ref={titleRef} placeholder="Title" className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm mb-2" />
          <select ref={audienceRef} className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm mb-2"><option>CSE 3rd Year - All Sections</option><option>Section A only</option><option>Section B only</option></select>
          <textarea ref={bodyRef} placeholder="Message..." rows={5} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none mb-3" />
          <button onClick={publish} className="w-full h-11 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold hover:opacity-95 active:scale-[0.99] transition-all">Publish</button>
        </Card>
      </div>
    </div>
  );
}
