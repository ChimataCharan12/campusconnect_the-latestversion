import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, QuickActionTile } from "@/components/admin-ui";
import { Calendar, CheckCircle2, Building2, GraduationCap, DoorOpen, Upload, Download, Plus, Filter, Copy, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { downloadTimetableXLSX, uploadFiles } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/timetable")({ component: Page });

const days = ["Mon 24 May","Tue 25 May","Wed 26 May","Thu 27 May","Fri 28 May","Sat 29 May"];
const slots = ["08:00 AM - 09:00 AM","09:00 AM - 10:00 AM","10:00 AM - 11:00 AM","11:00 AM - 12:00 PM","12:00 PM - 01:00 PM","01:00 PM - 02:00 PM","02:00 PM - 03:00 PM","03:00 PM - 04:00 PM"];
const palette = ["from-violet-50 to-violet-100 border-violet-200 text-violet-800","from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800","from-sky-50 to-sky-100 border-sky-200 text-sky-800","from-amber-50 to-amber-100 border-amber-200 text-amber-800","from-rose-50 to-rose-100 border-rose-200 text-rose-800","from-fuchsia-50 to-fuchsia-100 border-fuchsia-200 text-fuchsia-800"];
const grid: (null | { t: string; f: string; r: string; tint: number })[][] = [
  [{t:"Data Structures",f:"Dr. Arjun Mehta",r:"CS-301",tint:0},{t:"Operating Systems",f:"Prof. Priya Sharma",r:"CS-301",tint:1},{t:"Database Systems",f:"Dr. Rohit Verma",r:"CS-301",tint:2},{t:"Data Structures",f:"Dr. Arjun Mehta",r:"CS-301",tint:0},{t:"Computer Networks",f:"Prof. Sneha Iyer",r:"CS-301",tint:3},{t:"Aptitude Training",f:"Training Cell",r:"Lab-1",tint:4}],
  [{t:"Operating Systems",f:"Prof. Priya Sharma",r:"CS-301",tint:1},{t:"Database Systems",f:"Dr. Rohit Verma",r:"CS-301",tint:2},{t:"Computer Networks",f:"Prof. Sneha Iyer",r:"CS-301",tint:3},{t:"Operating Systems",f:"Prof. Priya Sharma",r:"CS-301",tint:1},{t:"Database Systems",f:"Dr. Rohit Verma",r:"CS-301",tint:2},null],
  [{t:"Computer Networks",f:"Prof. Sneha Iyer",r:"CS-301",tint:3},{t:"Data Structures",f:"Dr. Arjun Mehta",r:"CS-301",tint:0},{t:"Operating Systems",f:"Prof. Priya Sharma",r:"CS-301",tint:1},{t:"Database Systems",f:"Dr. Rohit Verma",r:"CS-301",tint:2},{t:"Data Structures",f:"Dr. Arjun Mehta",r:"CS-301",tint:0},null],
  [null,null,null,null,null,null],
  ["LUNCH" as any],
  [{t:"DBMS Lab",f:"Prof. Rohit Verma",r:"CS-Lab 1",tint:5},{t:"OS Lab",f:"Prof. Priya Sharma",r:"CS-Lab 2",tint:1},{t:"DBMS Lab",f:"Prof. Rohit Verma",r:"CS-Lab 1",tint:5},{t:"OS Lab",f:"Prof. Priya Sharma",r:"CS-Lab 2",tint:1},{t:"Mini Project",f:"Project Guide",r:"CS-Lab 3",tint:2},null],
  [{t:"Elective - AI",f:"Dr. Neha Singh",r:"CS-302",tint:4},{t:"Elective - AI",f:"Dr. Neha Singh",r:"CS-302",tint:4},{t:"Elective - AI",f:"Dr. Neha Singh",r:"CS-302",tint:4},{t:"Elective - AI",f:"Dr. Neha Singh",r:"CS-302",tint:4},{t:"Seminar / Activity",f:"Seminar Hall",r:"Activity Cell",tint:3},null],
  [{t:"Mentoring Session",f:"Dr. Arjun Mehta",r:"CS-301",tint:0},{t:"Mentoring Session",f:"Prof. Priya Sharma",r:"CS-301",tint:1},{t:"Mentoring Session",f:"Dr. Rohit Verma",r:"CS-301",tint:2},{t:"Mentoring Session",f:"Prof. Sneha Iyer",r:"CS-301",tint:3},null,null],
];

const summary = [
  { label: "Active 98 (79.03%)",    value: 98, color: "#10b981" },
  { label: "Draft 14 (11.29%)",     value: 14, color: "#f59e0b" },
  { label: "Published 8 (6.45%)",   value: 8,  color: "#7c3aed" },
  { label: "Archived 4 (3.23%)",    value: 4,  color: "#8b5cf6" },
];

function Page() {
  const [createOpen, setCreateOpen] = useState(false);
  const [extra, setExtra] = useState(0);
  const [published, setPublished] = useState(false);
  const [clashesOpen, setClashesOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Timetable Management" subtitle="Create, manage and publish timetables across all departments and classes."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={() => uploadFiles("Import Timetable", ".csv,.xlsx")}>Import Timetable</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadTimetableXLSX("admin-timetable.xlsx", days.map(d => d.split(" ")[0]), slots, days.map((_, di) => slots.map((__, si) => { const c = grid[si]?.[di] as any; if (!c || c === "LUNCH") return c === "LUNCH" ? "LUNCH" : ""; return `${c.t} (${c.f} · ${c.r})`; })))}>Export Timetable</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setCreateOpen(true)}>Create New Timetable</PrimaryButton>
        </div>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Calendar} label="Total Timetables" value={String(124 + extra)} tint="violet" trend="12 this month" />
        <MetricCard icon={CheckCircle2} label="Active Timetables" value={String(98 + extra)} tint="emerald" trend="8 this month" />
        <MetricCard icon={Building2} label="Classes Scheduled" value="326" tint="amber" trend="25 this month" />
        <MetricCard icon={GraduationCap} label="Faculty Assigned" value="156" tint="rose" trend="10 this month" />
        <MetricCard icon={DoorOpen} label="Rooms Utilized" value="42" tint="blue" trend="5 this month" />
      </div>
      <PageToolbar>
        <Sel l="Select Department" /><Sel l="Select Course" /><Sel l="Select Class / Section" /><Sel l="Select Semester" />
        <div className="h-11 px-3 rounded-xl border border-border bg-background text-sm flex items-center">May 24 – May 30, 2026</div>
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Computer Science - 3rd Year (A Section)" subtitle="Even Semester 2025-26" padding="p-4">
          <div className="flex gap-1 mb-3">{["Class Timetable","Faculty Timetable","Room Timetable"].map((t,i)=>(<button key={t} className={`px-3 py-2 text-[12.5px] font-semibold ${i===0?"text-primary border-b-2 border-primary":"text-muted-foreground"}`}>{t}</button>))}</div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px] grid grid-cols-[100px_repeat(6,1fr)] gap-1.5">
              <div className="text-[11px] font-bold text-muted-foreground p-2">Time</div>
              {days.map(d => (<div key={d} className="text-[11px] font-bold text-center p-2 bg-muted/40 rounded-lg">{d.split(" ")[0]}<br/><span className="text-muted-foreground font-normal">{d.split(" ").slice(1).join(" ")}</span></div>))}
              {slots.map((s, si) => (
                <>
                  <div key={s} className="text-[10px] text-muted-foreground p-2 font-medium">{s}</div>
                  {grid[si]?.[0] === "LUNCH" as any
                    ? <div className="col-span-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-2 text-center text-[12px] font-semibold text-amber-700 dark:text-amber-300">Lunch Break</div>
                    : Array.from({ length: 6 }).map((_, di) => {
                        const cell = grid[si]?.[di];
                        if (!cell || cell === "LUNCH" as any) return <div key={di} className="rounded-lg border border-dashed border-border/50 p-2 text-center text-muted-foreground text-[11px]">—</div>;
                        return (
                          <div key={di} className={`rounded-lg border bg-gradient-to-br ${palette[cell.tint]} p-2 text-[10.5px] leading-tight`}>
                            <div className="font-bold truncate">{cell.t}</div>
                            <div className="opacity-80 truncate">{cell.f}</div>
                            <div className="opacity-70 truncate">Room: {cell.r}</div>
                          </div>
                        );
                      })}
                </>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Timetable Summary">
            <div className="flex items-center gap-3">
              <Donut size={130} data={summary} center={<><div className="text-[16px] font-extrabold">124</div><div className="text-[9.5px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1 text-[11px] flex-1">{summary.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>
          <SectionCard title="Upcoming Changes" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-3 text-[12px]">
              <Li icon={Calendar} title="Management Workshop" sub="Room Change - CS-301 to CS-402" time="27 May 2026, 10:00 AM" />
              <Li icon={Calendar} title="Guest Lecture - AI Trends" sub="New Class Added (CSE - 3A)" time="28 May 2026, 02:00 PM" />
              <Li icon={Calendar} title="Lab Maintenance" sub="CS-Lab 2 will be unavailable" time="29 May 2026, Full Day" />
            </ul>
          </SectionCard>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={Plus} label="Create Timetable" tint="violet" onClick={() => setCreateOpen(true)} />
              <QuickActionTile icon={GraduationCap} label="Assign Faculty" tint="emerald" onClick={() => setCreateOpen(true)} />
              <QuickActionTile icon={DoorOpen} label="Manage Rooms" tint="blue" onClick={() => setCreateOpen(true)} />
              <QuickActionTile icon={Copy} label="Copy Timetable" tint="amber" onClick={() => { setExtra(extra + 1); toast.success("Timetable copied"); }} />
              <QuickActionTile icon={Upload} label={published ? "Unpublish Timetable" : "Publish Timetable"} tint="fuchsia" onClick={() => { setPublished(p => !p); toast.success(published ? "Timetable unpublished" : "Timetable published"); }} />
              <QuickActionTile icon={AlertTriangle} label="View Clashes" tint="rose" onClick={() => setClashesOpen(true)} />
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Timetable</DialogTitle><DialogDescription>Configure a new timetable for a class/section.</DialogDescription></DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = `${fd.get("dept")} - ${fd.get("year")} (${fd.get("sec")} Section)`;
              setExtra(extra + 1);
              toast.success(`Timetable created: ${name}`);
              setCreateOpen(false);
            }}
            className="grid grid-cols-2 gap-3"
          >
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Timetable Name</span><input name="name" required className="cc-input mt-1" placeholder="e.g. CS 3rd Year Even Sem" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Department</span>
              <select name="dept" defaultValue="Computer Science" className="cc-input mt-1"><option>Computer Science</option><option>Information Technology</option><option>Mechanical Engineering</option><option>Electronics & Comm.</option><option>Civil Engineering</option><option>Electrical Engineering</option></select>
            </label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Year</span>
              <select name="year" defaultValue="3rd Year" className="cc-input mt-1">{["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}</select>
            </label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Section</span>
              <select name="sec" defaultValue="A" className="cc-input mt-1">{["A","B","C","D"].map(s => <option key={s}>{s}</option>)}</select>
            </label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Semester</span>
              <select name="sem" defaultValue="Even" className="cc-input mt-1"><option>Even</option><option>Odd</option></select>
            </label>
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Effective From</span><input name="from" type="date" required className="cc-input mt-1" /></label>
            <div className="col-span-2"><DialogFooter>
              <button type="button" onClick={() => setCreateOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Create</button>
            </DialogFooter></div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={clashesOpen} onOpenChange={setClashesOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Timetable Clashes</DialogTitle><DialogDescription>Detected conflicts across faculty and rooms.</DialogDescription></DialogHeader>
          <div className="text-sm text-muted-foreground py-4">No clashes detected in the current schedule. {published ? "Status: Published" : "Status: Draft"}</div>
          <DialogFooter><button onClick={() => setClashesOpen(false)} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold">Close</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Sel({ l }: { l: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[160px]"><option>{l}</option></select>; }
function Li({ icon: Icon, title, sub, time }: any) { return (<li className="flex gap-2"><div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5" /></div><div className="flex-1 min-w-0"><div className="font-bold truncate">{title}</div><div className="text-[10.5px] text-muted-foreground">{sub}</div><div className="text-[10px] text-muted-foreground">{time}</div></div></li>); }
