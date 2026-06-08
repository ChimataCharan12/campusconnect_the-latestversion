import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { Calendar, Clock, Download, BookOpen, FileSpreadsheet } from "lucide-react";
import { downloadPDF, downloadTimetableXLSX } from "@/lib/files";

export const Route = createFileRoute("/parent/timetable")({ component: Page });

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const slots = ["09-10", "10-11", "11:15-12:15", "12:15-1:15", "2-3", "3-4"];
const grid = [
  ["Data Structures", "DBMS", "Operating Systems", "Data Structures", "DBMS", "Python Lab"],
  ["DBMS", "Data Structures", "Computer Networks", "DBMS", "Operating Systems", "Python Lab"],
  ["Operating Systems", "Computer Networks", "DBMS", "Computer Networks", "Data Structures", "—"],
  ["Computer Networks", "Operating Systems", "Data Structures", "Python", "Computer Networks", "Aptitude"],
  ["Python", "DBMS", "Operating Systems", "Data Structures", "Python", "Aptitude"],
  ["Python Lab", "Python Lab", "DBMS Lab", "Python Lab", "DBMS Lab", "—"],
];
const colors: Record<string, string> = {
  "Data Structures": "bg-violet-50 text-violet-700 border-l-4 border-violet-500 dark:bg-violet-500/10 dark:text-violet-300",
  "DBMS": "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Operating Systems": "bg-amber-50 text-amber-700 border-l-4 border-amber-500 dark:bg-amber-500/10 dark:text-amber-300",
  "Computer Networks": "bg-rose-50 text-rose-700 border-l-4 border-rose-500 dark:bg-rose-500/10 dark:text-rose-300",
  "Python": "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-500/10 dark:text-blue-300",
  "Python Lab": "bg-fuchsia-50 text-fuchsia-700 border-l-4 border-fuchsia-500 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  "DBMS Lab": "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Aptitude": "bg-slate-50 text-slate-700 border-l-4 border-slate-400 dark:bg-slate-500/10 dark:text-slate-300",
  "—": "text-muted-foreground",
};

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Child's Timetable" subtitle="Weekly schedule, today's classes and upcoming lectures."
        action={<div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadTimetableXLSX("child-timetable.xlsx", days, slots, grid)} className="px-3 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90"><FileSpreadsheet className="w-4 h-4" /> Download Excel</button>
          <button onClick={() => downloadPDF("Child's Timetable", grid.map((row, j) => `${days[j]}: ${row.join(" | ")}`).join("\n"), "child-timetable.pdf")} className="px-3 py-2 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5 hover:bg-muted"><Download className="w-4 h-4" /> PDF</button>
        </div>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Classes Today" value="6" tint="violet" />
        <StatCard icon={Clock} label="Completed" value="2" tint="emerald" sub="33% of today" />
        <StatCard icon={BookOpen} label="Upcoming" value="4" tint="amber" sub="Next: OS at 11:30 AM" />
        <StatCard icon={Clock} label="Free Time" value="1h 15m" tint="blue" sub="After lunch break" />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-lg mb-4">Weekly Timetable</h2>
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
                    return <td key={d} className={`p-3 border border-border text-center ${colors[subj] ?? ""}`}><div className="font-medium">{subj}</div></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-3">Next Class</h3>
          <div className="p-4 rounded-xl gradient-soft border border-border">
            <div className="text-xs text-primary font-bold uppercase">Starting in 35 min</div>
            <div className="font-semibold mt-1">Operating Systems (CS207)</div>
            <div className="text-sm text-muted-foreground">11:30 AM - 12:30 PM · Room B-201</div>
            <div className="text-sm text-muted-foreground">Dr. A. Singh</div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-3">Today's Classes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2.5 rounded-lg bg-muted/40"><span>09:00 AM · Data Structures</span><span className="text-emerald-600 font-semibold">Completed</span></div>
            <div className="flex justify-between p-2.5 rounded-lg bg-muted/40"><span>10:15 AM · DBMS</span><span className="text-emerald-600 font-semibold">Completed</span></div>
            <div className="flex justify-between p-2.5 rounded-lg bg-primary/10"><span>11:30 AM · Operating Systems</span><span className="text-primary font-semibold">Next</span></div>
            <div className="flex justify-between p-2.5 rounded-lg"><span>02:00 PM · Python Lab</span><span className="text-muted-foreground">Upcoming</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
