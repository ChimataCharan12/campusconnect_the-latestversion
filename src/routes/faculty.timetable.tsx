import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { Calendar, Clock, Download, MapPin, BookOpen, FileSpreadsheet } from "lucide-react";
import { downloadPDF, downloadTimetableXLSX } from "@/lib/files";

export const Route = createFileRoute("/faculty/timetable")({ component: Page });

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const slots = ["09-10", "10-11", "11:15-12:15", "12:15-1:15", "2-3", "3-4"];
const grid = [
  ["Data Structures (A)", "DBMS (B)", "—", "Data Structures (A)", "DBMS (B)", "DS Lab"],
  ["DBMS (B)", "Data Structures (A)", "Faculty Meet", "DBMS (B)", "Data Structures (A)", "DS Lab"],
  ["Data Structures (B)", "DBMS (A)", "Mentoring Hour", "DBMS (A)", "Data Structures (B)", "—"],
  ["—", "Project Reviews", "Data Structures (A)", "DBMS (B)", "—", "—"],
  ["DBMS (A)", "Data Structures (B)", "—", "Data Structures (B)", "DBMS (A)", "Lab"],
  ["DBMS Lab", "DS Lab", "DBMS Lab", "DS Lab", "DBMS Lab", "—"],
];
const colors: Record<string, string> = {
  "Data Structures (A)": "bg-violet-50 text-violet-700 border-l-4 border-violet-500 dark:bg-violet-500/10 dark:text-violet-300",
  "Data Structures (B)": "bg-violet-50 text-violet-700 border-l-4 border-violet-400 dark:bg-violet-500/10 dark:text-violet-300",
  "DBMS (A)": "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300",
  "DBMS (B)": "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-300",
  "DS Lab": "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-500/10 dark:text-blue-300",
  "DBMS Lab": "bg-fuchsia-50 text-fuchsia-700 border-l-4 border-fuchsia-500 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  "Lab": "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-500/10 dark:text-blue-300",
  "Faculty Meet": "bg-amber-50 text-amber-700 border-l-4 border-amber-500 dark:bg-amber-500/10 dark:text-amber-300",
  "Mentoring Hour": "bg-rose-50 text-rose-700 border-l-4 border-rose-500 dark:bg-rose-500/10 dark:text-rose-300",
  "Project Reviews": "bg-slate-50 text-slate-700 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-300",
  "—": "text-muted-foreground",
};

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Timetable"
        subtitle="Weekly teaching schedule and today's classes."
        action={<div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadTimetableXLSX("faculty-timetable.xlsx", days, slots, grid)} className="h-11 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90"><FileSpreadsheet className="w-4 h-4" /> Download Excel</button>
          <button onClick={() => downloadPDF("Faculty Timetable", grid.map((row, j) => `${days[j]}: ${row.join(" | ")}`).join("\n"), "faculty-timetable.pdf")} className="h-11 px-4 rounded-xl border border-border bg-card text-sm inline-flex items-center gap-2 hover:bg-muted"><Download className="w-4 h-4" /> PDF</button>
        </div>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Classes Today" value="4" tint="violet" />
        <StatCard icon={Clock} label="Completed" value="2" tint="emerald" sub="50% of today" />
        <StatCard icon={Clock} label="Upcoming" value="2" tint="amber" sub="Next: DBMS at 11:30 AM" />
        <StatCard icon={BookOpen} label="Weekly Load" value="24h" tint="blue" sub="Across 6 sections" />
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-4">Weekly Teaching Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs lg:text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left bg-primary text-primary-foreground rounded-l-lg">Time</th>
                {days.map(d => <th key={d} className="p-3 bg-primary text-primary-foreground text-center">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => (
                <tr key={slot}>
                  <td className="p-3 font-semibold border border-border bg-muted/40">{slot}</td>
                  {days.map((d, j) => {
                    const subj = grid[j][i];
                    return <td key={d} className={`p-3 border border-border text-center ${colors[subj] ?? "text-muted-foreground"}`}>
                      <div className="font-medium">{subj}</div>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-bold mb-3">Next Class</h3>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-card border border-violet-200/60 dark:from-violet-500/10 dark:border-violet-400/20">
            <div className="text-xs text-primary font-semibold uppercase">Starting in 35 min</div>
            <div className="font-semibold mt-1">Database Management Systems (CS305)</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> 11:30 AM - 12:30 PM</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Room B-202 · CSE 3rd Year, Section B</div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-3">Today's Classes</h3>
          <div className="space-y-2 text-sm">
            <Row t="09:00 AM · Data Structures (A)" status="Completed" tone="emerald" />
            <Row t="10:15 AM · DBMS (B)" status="Completed" tone="emerald" />
            <Row t="11:30 AM · DBMS (B)" status="Next" tone="violet" />
            <Row t="02:00 PM · DS Lab" status="Upcoming" tone="muted" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ t, status, tone }: { t: string; status: string; tone: "emerald" | "violet" | "muted" }) {
  const cls = tone === "emerald" ? "bg-emerald-50/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : tone === "violet" ? "bg-primary/10 text-primary font-semibold" : "bg-muted/40 text-muted-foreground";
  return (
    <div className={`flex justify-between p-3 rounded-lg ${cls}`}><span className="text-foreground/90">{t}</span><span>{status}</span></div>
  );
}
