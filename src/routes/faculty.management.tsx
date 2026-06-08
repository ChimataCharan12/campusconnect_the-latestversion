import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { AlertTriangle, TrendingUp, Eye, UserCog, Activity } from "lucide-react";
import { students } from "@/lib/mock";

export const Route = createFileRoute("/faculty/management")({ component: Page });

function Page() {
  const atRisk = students.filter(s => s.attendance < 75 || s.cgpa < 7);
  const top = [...students].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5);
  return (
    <div className="space-y-6">
      <PageHeader title="Student Management" subtitle="Monitor, support, and track student progress." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCog} label="Total Tracked" value={students.length} tint="violet" />
        <StatCard icon={AlertTriangle} label="At Risk" value={atRisk.length} tint="rose" />
        <StatCard icon={TrendingUp} label="Top 10%" value="8" tint="emerald" />
        <StatCard icon={Activity} label="Avg Attendance" value="82%" tint="blue" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 text-rose-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> At Risk Students</h3>
          <div className="space-y-3">
            {atRisk.map(s => (
              <div key={s.roll} className="p-3 rounded-xl border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center font-semibold">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.roll} · Attendance {s.attendance}% · CGPA {s.cgpa}</div>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-primary" /></button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3 text-emerald-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Performers</h3>
          <div className="space-y-3">
            {top.map((s, i) => (
              <div key={s.roll} className="p-3 rounded-xl border border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">#{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.roll} · CGPA {s.cgpa}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">{s.attendance}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
