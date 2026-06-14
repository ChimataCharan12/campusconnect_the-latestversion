import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import {
  Users, CheckCircle2, XCircle, Clock, Save, History, Search, Filter,
  UserCheck, UserX, Eraser, Info, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/faculty/attendance")({ component: Page });

type Status = "Present" | "Absent" | "Late";

interface LiveStudent {
  _id: string;
  rollNumber: string;
  branch: string;
  section: string;
  year: number;
  userId: { name: string; email: string };
}

interface ClassGroup {
  branch: string;
  section: string;
  year: number;
  semester: number;
  label: string;
}

interface HistoryEntry {
  date: string;
  subject: string;
  branch: string;
  section: string;
  year: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  savedAt: string;
}

function Page() {
  const { user } = useAuth();
  const token = user?.token;

  // Faculty profile state
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [slots, setSlots] = useState<any[]>([]);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<ClassGroup | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Students and marks
  const [students, setStudents] = useState<LiveStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Search / pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Fetch faculty profile on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        await fetch(`${API_BASE}/api/faculty/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        toast.error("Failed to load faculty profile");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // ── Fetch timetable slots to derive class groups ───────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/timetable`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.slots) {
          const fetchedSlots = data.data.slots;
          setSlots(fetchedSlots);
          const seen = new Set<string>();
          const groups: ClassGroup[] = [];
          for (const s of fetchedSlots) {
            const key = `${s.branch}-${s.section}-${s.year}-${s.semester}`;
            if (!seen.has(key)) {
              seen.add(key);
              groups.push({
                branch: s.branch,
                section: s.section,
                year: s.year,
                semester: s.semester,
                label: `${s.branch} - ${s.year}Y (${s.section}) - Sem ${s.semester}`,
              });
            }
          }
          // Sort by branch, year, section, semester
          groups.sort((a, b) => a.branch.localeCompare(b.branch) || a.year - b.year || a.section.localeCompare(b.section) || a.semester - b.semester);
          setClassGroups(groups);
          if (groups.length > 0) setSelectedGroup(groups[0]);
        }
      } catch {
        // silently fail — class dropdown will be empty
      }
    };
    fetchGroups();
  }, [token]);

  // ── Dynamically filter subjects for selected class group ───────────────────
  useEffect(() => {
    if (!selectedGroup || slots.length === 0) return;
    const groupSlots = slots.filter(
      s =>
        s.branch === selectedGroup.branch &&
        s.section === selectedGroup.section &&
        s.year === selectedGroup.year &&
        s.semester === selectedGroup.semester
    );
    const groupSubjects = [...new Set(groupSlots.map(s => s.subject))].filter(Boolean) as string[];
    setSubjects(groupSubjects);
    if (groupSubjects.length > 0) {
      setSelectedSubject(groupSubjects[0]);
    } else {
      setSelectedSubject("");
    }
  }, [selectedGroup, slots]);

  // ── Fetch students for selected class group ─────────────────────────────────
  const fetchStudents = useCallback(async (group: ClassGroup) => {
    if (!group) return;
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams({
        branch: group.branch,
        section: group.section,
        year: String(group.year),
      });
      const res = await fetch(`${API_BASE}/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.students) {
        const studs: LiveStudent[] = data.data.students;
        setStudents(studs);
        // Initialize marks — default to Present
        const initMarks: Record<string, Status> = {};
        studs.forEach((s) => { initMarks[s._id] = "Present"; });
        setMarks(initMarks);
        setRemarks({});
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedGroup) fetchStudents(selectedGroup);
  }, [selectedGroup, fetchStudents]);

  // ── Fetch existing attendance logs whenever students, subject, or date changes ──
  useEffect(() => {
    if (!token || !selectedGroup || !selectedSubject || !date || students.length === 0) return;
    
    const fetchExistingAttendance = async () => {
      try {
        const params = new URLSearchParams({
          branch: selectedGroup.branch,
          section: selectedGroup.section,
          year: String(selectedGroup.year),
          date: date,
          subject: selectedSubject,
        });
        const res = await fetch(`${API_BASE}/api/attendance/class?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        const newMarks: Record<string, Status> = {};
        const newRemarks: Record<string, string> = {};
        
        // Initialize default "Present" for all loaded students
        students.forEach(s => {
          newMarks[s._id] = "Present";
        });
        
        if (data.success && data.data?.logs?.length > 0) {
          data.data.logs.forEach((log: any) => {
            const sid = log.studentId?._id || log.studentId;
            if (sid) {
              newMarks[sid] = log.status;
              newRemarks[sid] = log.remarks || "";
            }
          });
        }
        setMarks(newMarks);
        setRemarks(newRemarks);
      } catch (error) {
        console.error("Error fetching existing attendance logs:", error);
      }
    };
    
    fetchExistingAttendance();
  }, [token, selectedGroup, selectedSubject, date, students]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const total = students.length;
  const present = Object.values(marks).filter(v => v === "Present").length;
  const absent = Object.values(marks).filter(v => v === "Absent").length;
  const late = Object.values(marks).filter(v => v === "Late").length;
  const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) : "0.0";

  const filtered = students.filter(s =>
    s.userId?.name?.toLowerCase().includes(q.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(q.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const set = (id: string, st: Status) => setMarks(m => ({ ...m, [id]: st }));
  const bulk = (st: Status) => setMarks(Object.fromEntries(students.map(s => [s._id, st])));
  const clear = () => setMarks(Object.fromEntries(students.map(s => [s._id, "Present" as Status])));

  // ── Save Attendance → POST /api/attendance/mark ─────────────────────────────
  const saveAttendance = async () => {
    if (!selectedSubject) { toast.error("Please select a subject"); return; }
    if (!selectedGroup) { toast.error("Please select a class"); return; }
    if (students.length === 0) { toast.error("No students loaded"); return; }

    setSaving(true);
    try {
      const attendanceLogs = students.map(s => ({
        studentId: s._id,
        status: marks[s._id] ?? "Present",
        remarks: remarks[s._id] ?? "",
      }));

      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: selectedSubject,
          date,
          attendanceLogs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Attendance saved for ${date} — ${present}/${total} present`);
      } else {
        toast.error(data.message || "Failed to save attendance");
      }
    } catch {
      toast.error("Network error while saving attendance");
    } finally {
      setSaving(false);
    }
  };

  // ── Load History → GET /api/attendance/class ────────────────────────────────
  const loadHistory = async () => {
    if (!selectedGroup || !selectedSubject) {
      toast.error("Select class and subject first");
      return;
    }
    setHistoryLoading(true);
    setHistoryOpen(true);
    setHistory([]);
    try {
      // Load last 14 days
      const entries: HistoryEntry[] = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const params = new URLSearchParams({
          branch: selectedGroup.branch,
          section: selectedGroup.section,
          year: String(selectedGroup.year),
          date: dateStr,
          subject: selectedSubject,
        });
        const res = await fetch(`${API_BASE}/api/attendance/class?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.count > 0) {
          const logs = data.data.logs;
          const p = logs.filter((l: any) => l.status === "Present").length;
          const a = logs.filter((l: any) => l.status === "Absent").length;
          const lt = logs.filter((l: any) => l.status === "Late").length;
          entries.push({
            date: dateStr,
            subject: selectedSubject,
            branch: selectedGroup.branch,
            section: selectedGroup.section,
            year: selectedGroup.year,
            present: p,
            absent: a,
            late: lt,
            total: logs.length,
            savedAt: logs[0]?.updatedAt || dateStr,
          });
        }
      }
      setHistory(entries);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const pieData = [
    { name: "Present", value: present, color: "#10b981" },
    { name: "Absent", value: absent, color: "#ef4444" },
    { name: "Late", value: late, color: "#f59e0b" },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading faculty profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mark Attendance" subtitle="Select class, subject and date to mark attendance." />

      {/* Filter bar */}
      <Card className="p-4">
        <div className="grid md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
          <Field label="Class">
            <select
              className="cc-input"
              value={selectedGroup ? `${selectedGroup.branch}|${selectedGroup.section}|${selectedGroup.year}|${selectedGroup.semester}` : ""}
              onChange={e => {
                const [branch, section, year, semester] = e.target.value.split("|");
                const g = classGroups.find(g => g.branch === branch && g.section === section && g.year === Number(year) && g.semester === Number(semester));
                if (g) { setSelectedGroup(g); setPage(1); }
              }}
            >
              {classGroups.length === 0 && <option>No classes found</option>}
              {classGroups.map(g => (
                <option key={`${g.branch}|${g.section}|${g.year}|${g.semester}`} value={`${g.branch}|${g.section}|${g.year}|${g.semester}`}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <select
              className="cc-input"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              {subjects.length === 0 && <option>No subjects assigned</option>}
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="cc-input" />
          </Field>
          <button onClick={loadHistory} className="h-11 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 inline-flex items-center gap-2">
            <History className="w-4 h-4" /> View History
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving || students.length === 0}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)] disabled:opacity-60"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={total} tint="violet" sub="Enrolled" />
        <StatCard icon={CheckCircle2} label="Present" value={<><span>{present}</span> <span className="text-base text-emerald-600 dark:text-emerald-300 font-semibold">({pct(present)}%)</span></>} tint="emerald" sub="Good" />
        <StatCard icon={XCircle} label="Absent" value={<><span>{absent}</span> <span className="text-base text-rose-600 dark:text-rose-300 font-semibold">({pct(absent)}%)</span></>} tint="rose" sub="Needs Attention" />
        <StatCard icon={Clock} label="Late" value={<><span>{late}</span> <span className="text-base text-amber-600 dark:text-amber-300 font-semibold">({pct(late)}%)</span></>} tint="amber" sub="Be on Time" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Table */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-lg">Student Attendance</h3>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 px-3 h-10 rounded-lg border border-border bg-background">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search student..." className="bg-transparent outline-none text-sm w-44" />
              </div>
              <button className="h-10 px-3 rounded-lg border border-border bg-card text-sm inline-flex items-center gap-1.5"><Filter className="w-4 h-4" /> Filters</button>
            </div>
          </div>

          {studentsLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No students found for selected class.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
                <colgroup>
                  <col className="w-10" /><col className="w-12" /><col className="w-32" />
                  <col /><col className="w-[240px]" /><col className="w-[28%]" />
                </colgroup>
                <thead>
                  <tr className="text-left">
                    <th className="cc-th py-3 px-3"></th>
                    <th className="cc-th py-3 px-2">#</th>
                    <th className="cc-th py-3 px-3">Roll No.</th>
                    <th className="cc-th py-3 px-3">Student Name</th>
                    <th className="cc-th py-3 px-3">Status</th>
                    <th className="cc-th py-3 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s, idx) => {
                    const st = marks[s._id] ?? "Present";
                    return (
                      <tr key={s._id} className="border-b border-border row-hover">
                        <td className="py-3.5 px-3 align-middle"><input type="checkbox" defaultChecked className="accent-primary w-4 h-4 align-middle" /></td>
                        <td className="py-3.5 px-2 align-middle text-muted-foreground font-medium">{(page - 1) * perPage + idx + 1}</td>
                        <td className="py-3.5 px-3 align-middle font-mono text-xs font-bold text-foreground/80">{s.rollNumber}</td>
                        <td className="py-3.5 px-3 align-middle font-semibold truncate">{s.userId?.name ?? "—"}</td>
                        <td className="py-3.5 px-3 align-middle">
                          <div className="flex gap-1.5">
                            <StatusBtn label="Present" active={st === "Present"} onClick={() => set(s._id, "Present")} tone="emerald" />
                            <StatusBtn label="Absent" active={st === "Absent"} onClick={() => set(s._id, "Absent")} tone="rose" />
                            <StatusBtn label="Late" active={st === "Late"} onClick={() => set(s._id, "Late")} tone="amber" />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 align-middle">
                          <input
                            value={remarks[s._id] ?? ""}
                            onChange={e => setRemarks(r => ({ ...r, [s._id]: e.target.value }))}
                            placeholder="Optional"
                            className="w-full px-3 h-9 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 outline-none transition"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-muted-foreground">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} students</div>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg border border-border hover:bg-muted inline-flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-semibold ${page === n ? "bg-gradient-to-br from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white" : "border border-border hover:bg-muted"}`}>{n}</button>
                  );
                })}
                {totalPages > 5 && <span className="px-1 text-muted-foreground">…</span>}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded-lg border border-border hover:bg-muted inline-flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold mb-4">Attendance Summary</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2} stroke="none">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-extrabold">{pct(present)}%</div>
                  <div className="text-[10px] text-muted-foreground">Overall</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm flex-1">
                <Legend dot="#10b981" label="Present" v={present} pct={pct(present)} />
                <Legend dot="#ef4444" label="Absent" v={absent} pct={pct(absent)} />
                <Legend dot="#f59e0b" label="Late" v={late} pct={pct(late)} />
              </ul>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAct icon={UserCheck} label="Mark All Present" sub="Mark all students as present" onClick={() => bulk("Present")} tint="emerald" />
              <QuickAct icon={UserX} label="Mark All Absent" sub="Mark all students as absent" onClick={() => bulk("Absent")} tint="rose" />
              <QuickAct icon={Clock} label="Mark All Late" sub="Mark all students as late" onClick={() => bulk("Late")} tint="amber" />
              <QuickAct icon={Eraser} label="Clear All" sub="Reset all attendance" onClick={clear} tint="violet" />
            </div>
          </Card>

          <Card className="p-5 bg-blue-50/60 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-blue-700 dark:text-blue-200">Note</div>
                <p className="text-xs text-blue-700/80 dark:text-blue-100/80 mt-0.5">You can edit attendance within 24 hours after the class.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance History</DialogTitle>
            <DialogDescription>Last 14 days of saved attendance for {selectedGroup?.label} — {selectedSubject}.</DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" /> Loading history...
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No saved sessions yet for this class and subject.</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground sticky top-0">
                  <tr><th className="text-left px-3 py-2">Date</th><th className="text-right px-3">Present</th><th className="text-right px-3">Absent</th><th className="text-right px-3">Late</th><th className="text-right px-3">Total</th></tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold">{h.date}</td>
                      <td className="px-3 text-right text-emerald-600">{h.present}</td>
                      <td className="px-3 text-right text-rose-600">{h.absent}</td>
                      <td className="px-3 text-right text-amber-600">{h.late}</td>
                      <td className="px-3 text-right text-muted-foreground">{h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setHistoryOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function StatusBtn({ label, active, onClick, tone }: { label: string; active: boolean; onClick: () => void; tone: "emerald" | "rose" | "amber" }) {
  const tones: Record<string, string> = {
    emerald: active ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/40" : "text-muted-foreground hover:bg-muted",
    rose: active ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/40" : "text-muted-foreground hover:bg-muted",
    amber: active ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40" : "text-muted-foreground hover:bg-muted",
  };
  return (
    <button onClick={onClick} className={`px-3 h-8 rounded-lg text-xs font-semibold border border-border ${tones[tone]}`}>{label}</button>
  );
}

function Legend({ dot, label, v, pct }: { dot: string; label: string; v: number; pct: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
      <span className="flex-1 text-foreground/80">{label}</span>
      <span className="font-bold">{v}</span>
      <span className="text-muted-foreground text-xs">({pct}%)</span>
    </li>
  );
}

function QuickAct({ icon: Icon, label, sub, onClick, tint }: any) {
  const bg: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    rose: "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300",
    amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
    violet: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300",
  };
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg[tint]}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
