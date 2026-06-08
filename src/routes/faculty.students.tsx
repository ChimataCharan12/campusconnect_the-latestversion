import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { Search, Eye, Users, TrendingUp } from "lucide-react";
import { students } from "@/lib/mock";
import { useState } from "react";

export const Route = createFileRoute("/faculty/students")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const list = students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.roll.includes(q));
  return (
    <div className="space-y-6">
      <PageHeader title="Student Directory" subtitle="Browse, search, and monitor your students." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value="240" tint="violet" />
        <StatCard icon={TrendingUp} label="Top Performers" value="42" tint="emerald" />
        <StatCard icon={Users} label="At Risk" value="8" tint="rose" />
        <StatCard icon={Users} label="Avg CGPA" value="7.8" tint="blue" />
      </div>
      <Card className="p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or roll..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>All Branches</option><option>CSE</option></select>
        <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>All Sections</option><option>A</option><option>B</option></select>
      </Card>
      <Card className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-muted-foreground text-left text-xs uppercase">
            <th className="py-2">Roll</th><th>Name</th><th>Branch</th><th>Section</th><th>Attendance</th><th>CGPA</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {list.map(s => (
              <tr key={s.roll} className="border-t border-border">
                <td className="py-3 font-mono text-xs">{s.roll}</td>
                <td className="font-medium">{s.name}</td>
                <td>{s.branch}</td>
                <td>{s.section}</td>
                <td><span className={s.attendance < 70 ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>{s.attendance}%</span></td>
                <td className="font-semibold">{s.cgpa}</td>
                <td><button className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-primary" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
