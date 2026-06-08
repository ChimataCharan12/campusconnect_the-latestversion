import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import { BarChart3, Trophy, TrendingDown, Award, Download, MessageSquare, History } from "lucide-react";
import { marks, performanceTrend, gradeDistribution } from "@/lib/mock";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { downloadPDF } from "@/lib/files";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/parent/performance")({ component: Page });

function Page() {
  const total = marks.reduce((s, m) => s + m.total, 0);
  const max = marks.length * 100;
  const overall = ((total / max) * 100).toFixed(2);
  const highest = marks.reduce((a, b) => (a.total > b.total ? a : b));
  const lowest = marks.reduce((a, b) => (a.total < b.total ? a : b));
  const navigate = useNavigate();
  const tabs = ["Subject-wise Marks", "Term Comparison", "Performance Analysis", "Grade Report"];
  const [tab, setTab] = useState(tabs[0]);
  const downloadMarksheet = () => downloadPDF("Marksheet — Semester 6", marks.map(m => `${m.name} (${m.code}): ${m.total}/100 — ${m.grade}`).join("\n"), "marksheet.pdf");
  const actions = [
    { icon: Download, label: "Download Marksheet", tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", onClick: downloadMarksheet },
    { icon: History, label: "View Previous Results", tint: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", onClick: () => toast.info("Previous results loaded", { description: "Sem 5: 76.8% · Sem 4: 78.1% · Sem 3: 74.5%" }) },
    { icon: MessageSquare, label: "Contact Teacher", tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", onClick: () => navigate({ to: "/parent/chatbot" }) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Performance"
        subtitle="View your child's subject-wise marks and performance details."
        action={
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
              <div className="w-7 h-7 rounded-full gradient-primary text-white text-[10px] flex items-center justify-center font-bold">AS</div>
              <div className="leading-tight"><div className="font-semibold text-xs">Ananya Sharma</div><div className="text-[10px] text-muted-foreground">CSE · 3rd Year (A)</div></div>
            </div>
            <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>Semester 6 (2024-25)</option><option>Semester 5</option></select>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Overall Percentage" value={`${overall}%`} tint="violet" sub="Good Performance" />
        <StatCard icon={Trophy} label={`Highest Score · ${highest.name}`} value={`${highest.total}/100`} tint="emerald" />
        <StatCard icon={TrendingDown} label={`Lowest Score · ${lowest.name}`} value={`${lowest.total}/100`} tint="amber" />
        <StatCard icon={Award} label="Rank in Class" value="5 / 60" tint="blue" sub="Top 10%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-border pb-3">
            <div className="flex gap-6 text-sm overflow-x-auto">
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)} className={`pb-2.5 -mb-3 whitespace-nowrap font-semibold transition-colors ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
            <button onClick={downloadMarksheet} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted"><Download className="w-3.5 h-3.5" /> Download Marksheet</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-[11px] uppercase tracking-wide">
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Internal /40</th>
                <th className="pb-3 font-semibold">External /60</th>
                <th className="pb-3 font-semibold">Total /100</th>
                <th className="pb-3 font-semibold">%</th>
                <th className="pb-3 font-semibold">Grade</th>
                <th className="pb-3 font-semibold">Remarks</th>
              </tr></thead>
              <tbody>
                {marks.map(m => {
                  const pct = m.total;
                  const pctColor = pct >= 80 ? "text-emerald-600" : pct >= 70 ? "text-blue-600" : pct >= 60 ? "text-amber-600" : "text-rose-600";
                  const gradeBg = m.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" :
                    m.grade.startsWith("B") ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
                  return (
                    <tr key={m.code} className="border-t border-border hover:bg-muted/40">
                      <td className="py-3 font-medium">{m.name}</td>
                      <td>{m.internal}</td>
                      <td>{m.external}</td>
                      <td className="font-semibold">{m.total}</td>
                      <td className={`font-bold ${pctColor}`}>{pct}%</td>
                      <td><span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${gradeBg}`}>{m.grade}</span></td>
                      <td className="text-muted-foreground">{m.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 text-xs text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Marks are for internal assessments only. Final marks will be published after end semester examinations.
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Grade Distribution</h3>
            <div className="h-44 relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {gradeDistribution.map((g, i) => <Cell key={i} fill={g.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-extrabold">{overall}%</div>
                <div className="text-[10px] text-muted-foreground">Overall</div>
              </div>
            </div>
            <ul className="text-xs space-y-1.5 mt-3">
              {gradeDistribution.map(g => (
                <li key={g.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} /> {g.name}</span>
                  <span className="font-bold">{g.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary/8 to-transparent">
            <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-primary" /><h3 className="font-bold">Teacher Remarks</h3></div>
            <p className="text-sm text-muted-foreground leading-relaxed">Ananya is performing well in most subjects. She should focus more on Discrete Mathematics to improve her understanding and scores.</p>
            <div className="text-xs text-muted-foreground mt-2">— Class Teacher</div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Performance Trend</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={performanceTrend} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <defs><linearGradient id="pt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0.3} /><stop offset="100%" stopColor="oklch(0.52 0.21 285)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
                <XAxis dataKey="month" stroke="oklch(0.50 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.50 0.03 270)" fontSize={11} domain={[60, 90]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.52 0.21 285)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((q, i) => (
              <button key={i} onClick={q.onClick} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:shadow-soft hover:-translate-y-0.5 transition-all text-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${q.tint}`}><q.icon className="w-5 h-5" /></div>
                <div className="text-[11px] font-semibold leading-tight">{q.label}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
