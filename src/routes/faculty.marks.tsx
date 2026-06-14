import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import {
  FileText, CheckCircle2, Users, BarChart3, Download, Upload, MoreVertical,
  Code2, BookOpen, Trophy, Lightbulb, CheckCheck, RefreshCw, Eye
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/faculty/marks")({ component: Page });

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface FacultySubject {
  code: string;
  name: string;
  branch: string;
  section: string;
  year: number;
  semester: number;
  studentsCount: number;
  uploaded: boolean;
  avg: number | null;
  color: string;
}

interface StudentRow {
  _id: string;
  rollNumber: string;
  name: string;
  internal: number;
  external: number;
  remarks: string;
}

const colors = ["violet", "emerald", "blue", "rose", "amber", "fuchsia"];

function Page() {
  const { user } = useAuth();
  const token = user?.token;

  const [loading, setLoading] = useState(true);
  const [subjectsList, setSubjectsList] = useState<FacultySubject[]>([]);
  const [editor, setEditor] = useState<FacultySubject | null>(null);

  // Hidden tabs per requirement 7 & 8
  const tabs = ["Upload Marks", "View & Edit Marks"/*, "Grade Analysis", "Performance Insights"*/];
  const [tab, setTab] = useState(tabs[0]);

  const fetchSubjectsAndStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch timetable slots to get faculty subjects and classes
      const slotsRes = await fetch(`${API_BASE}/api/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const slotsData = await slotsRes.json();
      if (slotsData.success && slotsData.data?.slots) {
        const slots = slotsData.data.slots;
        
        // Find unique subject-class combinations
        const seen = new Set<string>();
        const uniqueSubjects: any[] = [];
        slots.forEach((s: any) => {
          const key = `${s.subject}_${s.branch}_${s.section}_${s.year}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSubjects.push({
              code: s.code || "CS301",
              name: s.subject,
              branch: s.branch,
              section: s.section,
              year: s.year,
              semester: s.semester,
            });
          }
        });

        // 2. Fetch class marks for each subject to get stats
        const compiledList: FacultySubject[] = await Promise.all(
          uniqueSubjects.map(async (subj, idx) => {
            try {
              const params = new URLSearchParams({
                branch: subj.branch,
                section: subj.section,
                year: String(subj.year),
                subject: subj.name,
              });
              const res = await fetch(`${API_BASE}/api/marks/class?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.success && data.data?.students) {
                const students: StudentRow[] = data.data.students;
                const totalStudents = students.length;
                
                // Calculate average and check if uploaded
                let totalScoreSum = 0;
                let scoredStudents = 0;
                let uploaded = false;

                students.forEach((s) => {
                  if (s.internal > 0 || s.external > 0) {
                    uploaded = true;
                    totalScoreSum += (s.internal + s.external);
                    scoredStudents++;
                  }
                });

                const avg = scoredStudents > 0 ? (totalScoreSum / scoredStudents) : null;

                return {
                  ...subj,
                  studentsCount: totalStudents,
                  uploaded,
                  avg,
                  color: colors[idx % colors.length],
                };
              }
            } catch (err) {
              console.error(`Error fetching stats for ${subj.name}:`, err);
            }
            return {
              ...subj,
              studentsCount: 0,
              uploaded: false,
              avg: null,
              color: colors[idx % colors.length],
            };
          })
        );

        setSubjectsList(compiledList);
      }
    } catch (err) {
      console.error("Error loading faculty subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndStats();
  }, [token]);

  // Overall calculations for stats cards
  const stats = useMemo(() => {
    const totalSubjects = subjectsList.length;
    const uploadedCount = subjectsList.filter((s) => s.uploaded).length;
    const totalStudents = subjectsList.reduce((acc, s) => acc + s.studentsCount, 0);
    const validAverages = subjectsList.map((s) => s.avg).filter((v) => v !== null) as number[];
    const avgScore = validAverages.length > 0 ? validAverages.reduce((s, v) => s + v, 0) / validAverages.length : 0;
    return {
      totalSubjects,
      uploadedCount,
      totalStudents,
      avgScore: `${avgScore.toFixed(2)}%`,
    };
  }, [subjectsList]);

  const perfData = useMemo(() => {
    // Generate static breakdown or placeholder if no subjects loaded
    return [
      { name: "Excellent (80% and above)", value: 28, color: "#10b981" },
      { name: "Good (60% - 79%)", value: 20, color: "#3b82f6" },
      { name: "Average (40% - 59%)", value: 8, color: "#f59e0b" },
      { name: "Below Average (Below 40%)", value: 4, color: "#ef4444" },
    ];
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading subjects and marks overview...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Dashboard"
        subtitle="Manage and upload internal/external marks for your subjects."
        action={
          <div className="flex gap-2">
            <select className="h-11 px-4 rounded-xl border border-border bg-card text-sm"><option>CSE - 3rd Year (A)</option></select>
            <select className="h-11 px-4 rounded-xl border border-border bg-card text-sm"><option>Semester 6</option></select>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Subjects" value={String(stats.totalSubjects)} tint="violet" sub="This Semester" />
        <StatCard icon={CheckCircle2} label="Marks Uploaded" value={`${stats.uploadedCount} / ${stats.totalSubjects}`} tint="emerald" sub="Subjects" />
        <StatCard icon={Users} label="Total Students" value={String(stats.totalStudents)} tint="amber" sub="In Your Classes" />
        <StatCard icon={BarChart3} label="Average Score" value={stats.avgScore} tint="blue" sub="Class Averages" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-border w-full sm:w-auto overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV("marks-template.csv", [{ Roll: "23CSE001", Name: "Student Name", Internal: 0, External: 0 }])} className="h-11 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary/5">
            <Download className="w-4 h-4" /> Download Template
          </button>
          <button onClick={() => void uploadFiles("Marks file", ".csv,.xlsx")} className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)]">
            <Upload className="w-4 h-4" /> Upload Marks
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Subject-wise Marks Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left text-xs uppercase border-b border-border">
                  <th className="py-3">Subject</th>
                  <th>Internal (40)</th>
                  <th>External (60)</th>
                  <th>Students</th>
                  <th>Uploaded</th>
                  <th>Class Average</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subjectsList.map(s => {
                  const Ic = BookOpen;
                  const bg: Record<string, string> = {
                    violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
                    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
                    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
                    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
                    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
                    fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
                  };
                  const avgColor = s.avg == null ? "text-muted-foreground" : s.avg >= 80 ? "text-emerald-600 dark:text-emerald-300" : s.avg >= 70 ? "text-amber-600 dark:text-amber-300" : "text-rose-600 dark:text-rose-300";
                  return (
                    <tr key={`${s.code}_${s.branch}_${s.section}`} className="border-b border-border row-hover">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg[s.color]}`}><Ic className="w-5 h-5" /></div>
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.branch} - Year {s.year} ({s.section})</div>
                          </div>
                        </div>
                      </td>
                      <td>40</td>
                      <td>60</td>
                      <td>{s.studentsCount}</td>
                      <td>
                        {s.uploaded
                          ? <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30 font-semibold">Yes</span>
                          : <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30 font-semibold">No</span>}
                      </td>
                      <td className={`font-bold ${avgColor}`}>{s.avg != null ? `${s.avg.toFixed(2)}%` : "—"}</td>
                      <td>
                        <button onClick={() => setEditor(s)} className="px-3 h-8 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5">View / Edit</button>
                      </td>
                      <td><button onClick={() => downloadCSV(`${s.code}-marks.csv`, [{ Subject: s.name, Code: s.code, Students: s.studentsCount, Average: s.avg ?? "—" }])} className="p-1.5 rounded-lg hover:bg-muted" title="Export CSV"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Overall Class Performance</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={perfData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2} stroke="none">
                      {perfData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-extrabold">{stats.avgScore}</div>
                  <div className="text-[10px] text-muted-foreground">Average</div>
                </div>
              </div>
              <ul className="space-y-2 text-xs flex-1">
                {perfData.map((d, i) => {
                  const pct = ((d.value / 60) * 100).toFixed(2);
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 truncate">{d.name}</span>
                      <span className="font-bold">{d.value}</span>
                      <span className="text-muted-foreground">({pct}%)</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-violet-50/60 via-card to-card dark:from-violet-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold">Quick Tips</h3>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                "Double check that internal marks are out of 40 and external marks are out of 60.",
                "Ensure maximum marks are correct before saving.",
                "Students and parents will see updated grades instantly upon save.",
                "You can edit and overwrite saved marks anytime.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-foreground/80">{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="hidden"><Trophy /></div>

      <MarksEditorDialog subj={editor} onClose={() => setEditor(null)} onSaveSuccess={fetchSubjectsAndStats} token={token} />
    </div>
  );
}

function MarksEditorDialog({
  subj,
  onClose,
  onSaveSuccess,
  token
}: {
  subj: FacultySubject | null;
  onClose: () => void;
  onSaveSuccess: () => void;
  token: string | undefined;
}) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClassStudentsAndMarks = async () => {
    if (!subj || !token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        branch: subj.branch,
        section: subj.section,
        year: String(subj.year),
        subject: subj.name,
      });
      const res = await fetch(`${API_BASE}/api/marks/class?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.students) {
        setRows(data.data.students);
      }
    } catch (err) {
      console.error("Error loading class students and marks:", err);
      toast.error("Failed to load students list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassStudentsAndMarks();
  }, [subj, token]);

  const close = () => onClose();

  const handleFieldChange = (index: number, field: "internal" | "external" | "remarks", value: any) => {
    setRows((rs) =>
      rs.map((row, i) => {
        if (i === index) {
          const updated = { ...row, [field]: value };
          return updated;
        }
        return row;
      })
    );
  };

  const gradeFor = (total: number) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B+";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 40) return "D";
    return "F";
  };

  const save = async () => {
    if (!subj || !token) return;
    setSaving(true);
    try {
      const payload = {
        subject: subj.name,
        marksData: rows.map((r) => ({
          studentId: r._id,
          internal: Number(r.internal) || 0,
          external: Number(r.external) || 0,
          remarks: r.remarks || "",
        })),
      };

      const res = await fetch(`${API_BASE}/api/marks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Marks saved successfully for ${subj.name}`);
        onSaveSuccess();
        close();
      } else {
        toast.error(data.message || "Failed to save marks");
      }
    } catch (err) {
      console.error("Error saving marks:", err);
      toast.error("Network error while saving marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!subj} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{subj?.name} ({subj?.code})</DialogTitle>
          <DialogDescription>
            Enter and edit student marks for {subj?.branch} - Year {subj?.year} ({subj?.section}). Max Internal: 40, Max External: 60.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> Loading students list...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto rounded-xl border border-border min-h-[200px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3">Roll No</th>
                  <th className="text-left px-4">Student</th>
                  <th className="text-right px-4 w-28">Internal (/40)</th>
                  <th className="text-right px-4 w-28">External (/60)</th>
                  <th className="text-right px-4 w-20">Total</th>
                  <th className="text-center px-4 w-20">Grade</th>
                  <th className="text-left px-4 w-40">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const total = (Number(r.internal) || 0) + (Number(r.external) || 0);
                  const grade = gradeFor(total);
                  return (
                    <tr key={r._id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-mono text-xs">{r.rollNumber}</td>
                      <td className="px-4 font-medium">{r.name}</td>
                      <td className="px-4 text-right">
                        <input
                          type="number"
                          min={0}
                          max={40}
                          value={r.internal}
                          onChange={(e) => handleFieldChange(i, "internal", Math.min(40, Math.max(0, +e.target.value)))}
                          className="w-full h-8 px-2 rounded-lg border border-border bg-background text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 text-right">
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={r.external}
                          onChange={(e) => handleFieldChange(i, "external", Math.min(60, Math.max(0, +e.target.value)))}
                          className="w-full h-8 px-2 rounded-lg border border-border bg-background text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 text-right font-bold">{total}</td>
                      <td className="px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          grade.startsWith("A") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                          grade.startsWith("B") ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                          grade === "F" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>{grade}</span>
                      </td>
                      <td className="px-4">
                        <input
                          type="text"
                          value={r.remarks}
                          placeholder="e.g. Good"
                          onChange={(e) => handleFieldChange(i, "remarks", e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter className="mt-4 shrink-0">
          <button onClick={close} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={saving || loading} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet disabled:opacity-60 inline-flex items-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null} {saving ? "Saving..." : "Save Marks"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
