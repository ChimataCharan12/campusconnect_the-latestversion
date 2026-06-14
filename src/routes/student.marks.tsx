import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import { BarChart3, Target, TrendingUp, Trophy, Download, RefreshCw } from "lucide-react";
import { performanceTrend, gradeDistribution as mockGradeDistribution } from "@/lib/mock";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { downloadPDF, downloadXLSX } from "@/lib/files";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/student/marks")({ component: Page });

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const gradeColor: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  A: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  "B+": "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
  B: "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
  C: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  D: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
  F: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
};

interface StudentMark {
  name: string;
  code: string;
  internal: number;
  external: number;
  total: number;
  percentage: number;
  grade: string;
  remark: string;
}

function Page() {
  const { user } = useAuth();
  const token = user?.token;
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const profileRes = await fetch(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data?.profile) {
          const sid = profileData.data.profile._id;
          const marksRes = await fetch(`${API_BASE}/api/marks/student/${sid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const marksData = await marksRes.json();
          if (marksData.success) {
            setMarks(marksData.data.marks || []);
          }
        }
      } catch (err) {
        console.error("Error loading marks:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const stats = useMemo(() => {
    if (marks.length === 0) {
      return { avg: "0.00%", highest: "—", lowest: "—", highestName: "N/A", lowestName: "N/A" };
    }
    const totals = marks.map(m => m.total);
    const sum = totals.reduce((s, v) => s + v, 0);
    const avg = `${(sum / marks.length).toFixed(2)}%`;
    const highestVal = Math.max(...totals);
    const lowestVal = Math.min(...totals);
    const highestMarkObj = marks.find(m => m.total === highestVal);
    const lowestMarkObj = marks.find(m => m.total === lowestVal);
    return {
      avg,
      highest: `${highestVal}/100`,
      lowest: `${lowestVal}/100`,
      highestName: highestMarkObj?.name || "N/A",
      lowestName: lowestMarkObj?.name || "N/A",
    };
  }, [marks]);

  const gradeDistribution = useMemo(() => {
    if (marks.length === 0) return mockGradeDistribution;
    let excellent = 0;
    let good = 0;
    let average = 0;
    let below = 0;

    marks.forEach(m => {
      if (m.total >= 80) excellent++;
      else if (m.total >= 60) good++;
      else if (m.total >= 40) average++;
      else below++;
    });

    return [
      { name: "Excellent (80%+)", value: excellent, color: "oklch(0.65 0.16 150)" },
      { name: "Good (60-79%)", value: good, color: "oklch(0.65 0.15 240)" },
      { name: "Average (40-59%)", value: average, color: "oklch(0.75 0.16 65)" },
      { name: "Below 40%", value: below, color: "oklch(0.62 0.22 25)" },
    ];
  }, [marks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading marks & performance...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Marks & Performance" subtitle="View your subject-wise marks and performance analysis."
        action={
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>Semester 6</option></select>
            <button
              onClick={() => downloadXLSX("marksheet.xlsx", marks, "Marks")}
              className="h-10 px-3 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5 hover:bg-muted"
            ><Download className="w-4 h-4" /> Excel</button>
            <button
              onClick={() => downloadPDF("Marksheet - Semester 6", marks.map(m => `${m.name} (${m.code}): ${m.total}/100 — ${m.grade}`).join("\n"), "marksheet.pdf")}
              className="h-10 px-3 rounded-lg bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-semibold inline-flex items-center gap-1.5 shadow-soft"
            ><Download className="w-4 h-4" /> PDF</button>
          </div>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Semester Average" value={stats.avg} tint="violet" sub="Real-time" />
        <StatCard icon={Target} label="Highest Score" value={stats.highest} tint="emerald" sub={stats.highestName} />
        <StatCard icon={TrendingUp} label="Lowest Score" value={stats.lowest} tint="amber" sub={stats.lowestName} />
        <StatCard icon={Trophy} label="Rank in Class" value="N/A" tint="blue" sub="Top 10%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex gap-6 border-b border-border pb-3 mb-4 text-sm">
            <button className="font-semibold text-primary border-b-2 border-primary pb-2 -mb-3">Subject-wise Marks</button>
            {/* Hide unfinished UI tabs */}
            {/* <button className="text-muted-foreground">Performance Analysis</button> */}
            {/* <button className="text-muted-foreground">Grade Report</button> */}
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide bg-gradient-to-r from-[oklch(0.52_0.21_285)] via-[oklch(0.48_0.22_285)] to-[oklch(0.42_0.22_270)] text-white">
                  <th className="py-3.5 px-4 font-bold">Subject</th>
                  <th className="px-4 font-bold">Internal (40)</th>
                  <th className="px-4 font-bold">External (60)</th>
                  <th className="px-4 font-bold">Total</th>
                  <th className="px-4 font-bold">%</th>
                  <th className="px-4 font-bold">Grade</th>
                  <th className="px-4 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => (
                  <tr key={m.code} className={`border-t border-border transition-colors hover:bg-primary/5 ${i % 2 ? "bg-muted/20" : ""}`}>
                    <td className="py-3.5 px-4"><div className="font-semibold">{m.name}</div><div className="text-xs text-muted-foreground">{m.code}</div></td>
                    <td className="px-4 tabular-nums">{m.internal}/40</td>
                    <td className="px-4 tabular-nums">{m.external}/60</td>
                    <td className="px-4 font-semibold tabular-nums">{m.total}/100</td>
                    <td className={`px-4 font-bold tabular-nums ${m.total >= 80 ? "text-emerald-600" : m.total >= 70 ? "text-blue-600" : m.total >= 60 ? "text-amber-600" : "text-rose-600"}`}>{m.total}%</td>
                    <td className="px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${gradeColor[m.grade] || "bg-muted text-muted-foreground"}`}>{m.grade}</span></td>
                    <td className={`px-4 text-sm font-medium ${m.total >= 80 ? "text-emerald-600" : m.total >= 70 ? "text-blue-600" : m.total >= 60 ? "text-amber-600" : "text-rose-600"}`}>{m.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Overall Performance</h2>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={gradeDistribution} dataKey="value" innerRadius={50} outerRadius={80}>
                  {gradeDistribution.map((g, i) => <Cell key={i} fill={g.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {gradeDistribution.map(g => (
              <div key={g.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: g.color }} /> {g.name}</span>
                <span className="font-semibold">{g.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Performance Trend</h2>
          <div className="h-56"><ResponsiveContainer>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
              <Line type="monotone" dataKey="value" stroke="oklch(0.52 0.21 285)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer></div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Subject Comparison</h2>
          <div className="h-56"><ResponsiveContainer>
            <BarChart data={marks.map(m => ({ name: m.code, total: m.total }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 285)" />
              <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip />
              <Bar dataKey="total" fill="oklch(0.52 0.21 285)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </Card>
      </div>

      <Card className="p-6 gradient-soft">
        <h3 className="font-semibold mb-3">💡 Tips to Improve</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Focus more on Discrete Mathematics.</li>
          <li>✓ Solve previous year papers.</li>
          <li>✓ Attend doubt clearing sessions.</li>
          <li>✓ Maintain consistent study and revision.</li>
        </ul>
      </Card>
    </div>
  );
}
