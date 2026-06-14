import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { ClipboardList, GraduationCap, Trophy, CheckCircle2, FileCheck, Plus, Upload, Download, Filter, Eye, Pencil, Search, Edit3, Send, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV, downloadPDF, importTableFile, uploadFiles } from "@/lib/files";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/marks")({ component: Page });

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface SubjectScore {
  subject: string;
  internal: number;
  external: number;
  total: number;
}

interface StudentRow {
  roll: string;
  name: string;
  dept: string;
  sem: string;
  sub: number;
  total: string;
  pct: number;
  grade: string;
  status: "Pass" | "Fail";
  studentId: string;
  subjects: SubjectScore[];
}

const deptColors = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function Page() {
  const { user } = useAuth();
  const token = user?.token;

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRow, setEditingRow] = useState<StudentRow | null>(null);
  const [viewingRow, setViewingRow] = useState<StudentRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

  const fetchSummary = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/marks/admin/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.students) {
        setRows(data.data.students);
      } else {
        toast.error("Failed to load marks summary");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading marks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dept.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  // Dynamic Metrics calculations
  const metrics = useMemo(() => {
    const totalStudents = rows.length;
    const avgPct = totalStudents > 0 
      ? rows.reduce((s, r) => s + r.pct, 0) / totalStudents 
      : 0;
    const highestPct = totalStudents > 0 
      ? Math.max(...rows.map(r => r.pct)) 
      : 0;
    const passCount = rows.filter(r => r.status === "Pass").length;
    const passPct = totalStudents > 0 
      ? (passCount / totalStudents) * 100 
      : 0;

    return {
      totalStudents,
      avgPct: `${avgPct.toFixed(2)}%`,
      highestPct: `${highestPct.toFixed(2)}%`,
      passPct: `${passPct.toFixed(2)}%`,
    };
  }, [rows]);

  // Dynamic Donut calculations
  const distributionData = useMemo(() => {
    let aPlus = 0; // 90-100
    let a = 0;     // 80-90
    let bPlus = 0; // 70-80
    let b = 0;     // 60-70
    let c = 0;     // 50-60
    let f = 0;     // Below 50

    rows.forEach(r => {
      if (r.pct >= 90) aPlus++;
      else if (r.pct >= 80) a++;
      else if (r.pct >= 70) bPlus++;
      else if (r.pct >= 60) b++;
      else if (r.pct >= 50) c++;
      else f++;
    });

    const total = rows.length || 1;
    return [
      { label: `90-100% (A+) ${Math.round((aPlus / total) * 100)}% (${aPlus})`, value: aPlus, color: "#7c3aed" },
      { label: `80-90% (A) ${Math.round((a / total) * 100)}% (${a})`,   value: a, color: "#06b6d4" },
      { label: `70-80% (B+) ${Math.round((bPlus / total) * 100)}% (${bPlus})`,  value: bPlus, color: "#10b981" },
      { label: `60-70% (B) ${Math.round((b / total) * 100)}% (${b})`,   value: b, color: "#f59e0b" },
      { label: `50-60% (C) ${Math.round((c / total) * 100)}% (${c})`,    value: c, color: "#ef4444" },
      { label: `Below 50% (F) ${Math.round((f / total) * 100)}% (${f})`,  value: f,  color: "#8b5cf6" },
    ];
  }, [rows]);

  // Dynamic Top Performers
  const topPerformers = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5)
      .map((r, idx) => ({
        rank: idx === 0 ? "🏆" : idx === 2 ? "🥉" : String(idx + 1),
        name: `${r.name} (${r.dept})`,
        v: `${r.pct.toFixed(2)}%`
      }));
  }, [rows]);

  const handleEditFieldChange = (idx: number, field: "internal" | "external", val: number) => {
    if (!editingRow) return;
    const nextSubjs = editingRow.subjects.map((sub, sidx) => {
      if (sidx === idx) {
        const updated = { ...sub, [field]: val };
        updated.total = updated.internal + updated.external;
        return updated;
      }
      return sub;
    });

    // Recompute total sum, percentage
    const nextTotalSum = nextSubjs.reduce((s, x) => s + x.total, 0);
    const nextAvg = nextSubjs.length > 0 ? nextTotalSum / nextSubjs.length : 0;
    const status = nextAvg >= 40 ? "Pass" : "Fail";

    setEditingRow({
      ...editingRow,
      subjects: nextSubjs,
      total: `${nextTotalSum} / ${nextSubjs.length * 100}`,
      pct: Number(nextAvg.toFixed(2)),
      status,
    });
  };

  const handleSaveEditedMarks = async () => {
    if (!editingRow || !token) return;
    setSaving(true);
    try {
      // Make parallel update calls for each edited subject
      await Promise.all(
        editingRow.subjects.map((sub) => {
          return fetch(`${API_BASE}/api/marks/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              subject: sub.subject,
              marksData: [
                {
                  studentId: editingRow.studentId,
                  internal: sub.internal,
                  external: sub.external,
                  remarks: editingRow.status === "Pass" ? "Passed" : "Fail"
                }
              ]
            })
          });
        })
      );

      toast.success(`Marks updated successfully for ${editingRow.name}`);
      setEditingRow(null);
      fetchSummary();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save student marks");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading marks database...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Marks Management" subtitle="Manage and analyze student marks and academic performance."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={async () => { const r = await importTableFile("Marks", ".csv,.xlsx"); if (r?.rows?.length) toast.success(`${r.rows.length} rows imported`); }}>Import Marks</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("marks.csv", rows)}>Export Data</GhostButton>
        </div>}
      />
      <PageToolbar>
        <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background text-sm w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search student or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-xs flex-1"
          />
        </div>
        <div className="h-11 px-3 rounded-xl border border-border bg-background text-sm flex items-center">Academic Session 2025 - 2026</div>
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={ClipboardList} label="Total Students" value={String(metrics.totalStudents)} tint="violet" trend="Database active count" />
        <MetricCard icon={GraduationCap} label="Average Marks" value={metrics.avgPct} tint="emerald" trend="Combined overall" />
        <MetricCard icon={Trophy} label="Highest Marks" value={metrics.highestPct} tint="amber" trend="Top performer" />
        <MetricCard icon={CheckCircle2} label="Pass Percentage" value={metrics.passPct} tint="rose" trend="Passing threshold 40%" />
        <MetricCard icon={FileCheck} label="Results Status" value={published ? "Published" : "Draft"} tint="blue" trend="System status" trendDir="flat" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Student Marks Overview" padding="p-0" action={
          <div className="flex items-center gap-2">
            <div className="flex bg-muted/40 rounded-xl p-1">
              {["By Student"/*, "By Subject", "By Exam Type"*/].map((t, i) => (<button key={t} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg ${i === 0 ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow" : "text-muted-foreground"}`}>{t}</button>))}
            </div>
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40"><th className="px-4 py-3 text-left w-10"><input type="checkbox" /></th><th className="px-4 py-3 text-left">Roll No</th><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Dept</th><th className="px-4 py-3 text-left">Semester</th><th className="px-4 py-3 text-left">Subjects</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">%</th><th className="px-4 py-3 text-left">Grade</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th></tr></thead>
              <tbody>
                {filteredRows.map(r => (
                  <tr key={r.roll} className="border-t border-border/60 hover:bg-primary/5">
                    <td className="px-4 py-3"><input type="checkbox" /></td>
                    <td className="px-4 py-3 font-mono text-[12px] font-semibold">{r.roll}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{r.name.split(" ").map(n=>n[0]).join("")}</div><span className="font-semibold">{r.name}</span></div></td>
                    <td className="px-4 py-3">{r.dept}</td><td className="px-4 py-3">{r.sem}</td><td className="px-4 py-3">{r.sub}</td><td className="px-4 py-3">{r.total}</td><td className="px-4 py-3 font-semibold">{r.pct}%</td>
                    <td className="px-4 py-3"><StatusPill tone={r.grade.startsWith("A")?"success":r.grade.startsWith("B")?"info":"warning"}>{r.grade}</StatusPill></td>
                    <td className="px-4 py-3"><StatusPill tone={r.status==="Pass"?"success":"danger"}>{r.status}</StatusPill></td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={() => setViewingRow(r)} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingRow(r)} className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Marks Distribution">
            <div className="flex flex-col items-center gap-3">
              <Donut size={150} data={distributionData} center={<><div className="text-[16px] font-extrabold">{metrics.totalStudents}</div><div className="text-[9.5px] text-muted-foreground">Students</div></>} />
              <ul className="space-y-1 text-[10.5px] w-full">{distributionData.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>
          <SectionCard title="Top Performers">
            <ul className="space-y-2.5 text-[12.5px]">{topPerformers.map((t,i)=>(<li key={i} className="flex items-center gap-2"><div className="w-6 text-center">{t.rank}</div><div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{t.name[0]}</div><div className="flex-1 font-medium">{t.name}</div><div className="font-bold">{t.v}</div></li>))}</ul>
          </SectionCard>
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={Upload} label="Bulk Upload" tint="emerald" onClick={() => uploadFiles("Bulk Marks", ".csv,.xlsx")} />
              <QuickActionTile icon={Download} label="Generate Report" tint="amber" onClick={() => downloadPDF("Marks Report", `<p>Average: ${metrics.avgPct} across ${metrics.totalStudents} students.</p>`)} />
              <QuickActionTile icon={Send} label={published ? "Unpublish Results" : "Publish Results"} tint="fuchsia" onClick={() => { setPublished(p => !p); toast.success(published ? "Results unpublished" : "Results published"); }} />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Edit Marks Dialog */}
      <Dialog open={!!editingRow} onOpenChange={(v) => !v && setEditingRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Marks — {editingRow?.name}</DialogTitle>
            <DialogDescription>Edit subject-wise internal (max 40) and external (max 60) marks for {editingRow?.roll}.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-xl border border-border min-h-[150px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5">Subject</th>
                  <th className="text-right px-4 w-28">Internal (/40)</th>
                  <th className="text-right px-4 w-28">External (/60)</th>
                  <th className="text-right px-4 w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {editingRow?.subjects.map((s, idx) => (
                  <tr key={s.subject} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{s.subject}</td>
                    <td className="px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={s.internal}
                        onChange={(e) => handleEditFieldChange(idx, "internal", Math.min(40, Math.max(0, +e.target.value)))}
                        className="w-full h-8 px-2 rounded-lg border border-border bg-background text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={s.external}
                        onChange={(e) => handleEditFieldChange(idx, "external", Math.min(60, Math.max(0, +e.target.value)))}
                        className="w-full h-8 px-2 rounded-lg border border-border bg-background text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 text-right font-bold">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="mt-4 shrink-0">
            <button type="button" onClick={() => setEditingRow(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
            <button type="button" onClick={handleSaveEditedMarks} disabled={saving} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-bold disabled:opacity-60 inline-flex items-center gap-2">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null} {saving ? "Saving..." : "Save Marks"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Marks Dialog */}
      <Dialog open={!!viewingRow} onOpenChange={(v) => !v && setViewingRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>View Marks — {viewingRow?.name}</DialogTitle>
            <DialogDescription>Detailed subject-wise grades for {viewingRow?.roll}.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-xl border border-border min-h-[150px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5">Subject</th>
                  <th className="text-right px-4 w-28">Internal (/40)</th>
                  <th className="text-right px-4 w-28">External (/60)</th>
                  <th className="text-right px-4 w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewingRow?.subjects.map((s) => (
                  <tr key={s.subject} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{s.subject}</td>
                    <td className="px-4 text-right">{s.internal} / 40</td>
                    <td className="px-4 text-right">{s.external} / 60</td>
                    <td className="px-4 text-right font-bold">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="mt-4 shrink-0">
            <button type="button" onClick={() => setViewingRow(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
