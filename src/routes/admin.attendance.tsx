import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Calendar, Filter, Upload, Download, Plus, Eye, ClipboardCheck, FileText, Bell, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/admin/attendance")({ component: Page });

const tabs = ["By Class", "By Course", "By Faculty", "By Department"];

interface ClassRow {
  branch: string;
  section: string;
  year: number;
  label: string;
  total: number;
  records: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface OverallStats {
  totalStudents: number;
  totalRecords: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overallPercentage: number;
}

function Page() {
  const [tab, setTab] = useState(0);
  const [markOpen, setMarkOpen] = useState(false);
  const [viewing, setViewing] = useState<ClassRow | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [rows, setRows] = useState<ClassRow[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter states
  const [deptFilter, setDeptFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");

  // Fetch admin attendance summary
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance/admin/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRows(data.data.classes || []);
        setOverall(data.data.overall || null);
      } else {
        toast.error(data.message || "Failed to load attendance summary");
      }
    } catch {
      toast.error("Network error loading attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary();
    }
  }, [token]);

  // Derive filter options dynamically from raw rows
  const departments = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.branch))).sort();
  }, [rows]);

  const courses = useMemo(() => {
    const years = Array.from(new Set(rows.map((r) => r.year))).sort();
    return years.map((y) => {
      if (y === 1) return "1st Year";
      if (y === 2) return "2nd Year";
      if (y === 3) return "3rd Year";
      return `${y}th Year`;
    });
  }, [rows]);

  const classesList = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.label))).sort();
  }, [rows]);

  // Apply filters to compute filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchDept = deptFilter === "All" || r.branch === deptFilter;
      
      const yearLabel = r.year === 1 ? "1st Year" : r.year === 2 ? "2nd Year" : r.year === 3 ? "3rd Year" : `${r.year}th Year`;
      const matchCourse = courseFilter === "All" || yearLabel === courseFilter;
      
      const matchClass = classFilter === "All" || r.label === classFilter;
      
      return matchDept && matchCourse && matchClass;
    });
  }, [rows, deptFilter, courseFilter, classFilter]);

  // Compute overall statistics dynamically based on filtered rows
  const computedOverall = useMemo(() => {
    let totalStudents = 0;
    let totalRecords = 0;
    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;
    
    filteredRows.forEach((r) => {
      totalStudents += r.total;
      totalRecords += r.records || 0;
      presentToday += r.present;
      absentToday += r.absent;
      lateToday += r.late;
    });
    
    const overallPercentage = totalRecords > 0 ? Math.round((presentToday / totalRecords) * 100) : 0;
    
    return {
      totalStudents,
      totalRecords,
      presentToday,
      absentToday,
      lateToday,
      overallPercentage,
    };
  }, [filteredRows]);

  const hasTodayData = computedOverall && computedOverall.totalRecords > 0;

  // Build department donut from filtered class rows
  const deptMap: Record<string, { present: number; records: number }> = {};
  for (const r of filteredRows) {
    if (!deptMap[r.branch]) deptMap[r.branch] = { present: 0, records: 0 };
    deptMap[r.branch].present += r.present;
    deptMap[r.branch].records += r.records || 0;
  }
  const deptColors = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const deptData = Object.entries(deptMap).map(([label, { present, records }], i) => ({
    label: `${label} ${records > 0 ? Math.round((present / records) * 100) : 0}% (${present}/${records})`,
    value: present,
    color: deptColors[i % deptColors.length],
  }));

  // Build trend from today going back 7 days (using computedOverall stats)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      d: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      v: i === 6 && computedOverall ? computedOverall.overallPercentage : 0,
    };
  });

  const exportData = () => downloadCSV("attendance.csv", filteredRows.map(r => ({
    Class: r.label, Total: r.total, Present: r.present, Absent: r.absent, Late: r.late, "Percentage": `${r.percentage}%`
  })));

  const handleMarkAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cls = fd.get("cls") as string;
    const date = fd.get("date") as string;
    const subject = fd.get("subject") as string;

    if (!subject) { toast.error("Please select a subject"); return; }

    // Find class row
    const row = rows.find(r => r.label === cls);
    if (!row) { toast.error("Class not found"); return; }

    setSaving(true);
    try {
      // Fetch students for this class
      const params = new URLSearchParams({ branch: row.branch, section: row.section, year: String(row.year) });
      const studRes = await fetch(`${API_BASE}/api/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studData = await studRes.json();
      if (!studData.success) throw new Error("Failed to load students");
      const students = studData.data.students;

      // Mark all as Present by default
      const attendanceLogs = students.map((s: any) => ({
        studentId: s._id,
        status: "Present",
        remarks: "",
      }));

      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, date, attendanceLogs }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Attendance saved for ${cls} on ${date} (${students.length} students marked Present)`);
        setMarkOpen(false);
        fetchSummary();
      } else {
        toast.error(data.message || "Failed to save attendance");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Management" subtitle="Monitor and manage attendance across all departments, classes and students."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={() => uploadFiles("Bulk Attendance", ".csv,.xlsx")}>Import Attendance</GhostButton>
          <GhostButton icon={Download} onClick={exportData}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setMarkOpen(true)}>Mark Attendance</PrimaryButton>
        </div>}
      />
      <PageToolbar>
        <Select label="Select Department" options={departments} value={deptFilter} onChange={setDeptFilter} />
        <Select label="Select Course" options={courses} value={courseFilter} onChange={setCourseFilter} />
        <Select label="Select Class / Section" options={classesList} value={classFilter} onChange={setClassFilter} />
        <label className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background text-sm cursor-pointer hover:bg-muted/60">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} onChange={(e) => toast.success(`Date set to ${new Date(e.target.value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`)} className="bg-transparent outline-none cursor-pointer" />
        </label>
        <GhostButton icon={Filter} onClick={fetchSummary}>Refresh</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={CalendarCheck} label="Overall Attendance" value={loading ? "—" : (hasTodayData ? `${computedOverall.overallPercentage}%` : "No attendance recorded yet")} tint="violet" trend={hasTodayData ? "Today's snapshot" : "—"} />
        <MetricCard icon={CheckCircle2} label="Present Today" value={loading ? "—" : (hasTodayData ? String(computedOverall.presentToday) : "—")} tint="emerald" trend={hasTodayData ? `of ${computedOverall.totalStudents} students` : "—"} />
        <MetricCard icon={XCircle} label="Absent Today" value={loading ? "—" : (hasTodayData ? String(computedOverall.absentToday) : "—")} tint="rose" trend={hasTodayData ? "Needs follow-up" : "—"} trendDir={hasTodayData ? "down" : "flat"} />
        <MetricCard icon={Clock} label="Late Today" value={loading ? "—" : (hasTodayData ? String(computedOverall.lateToday) : "—")} tint="amber" trend={hasTodayData ? "Tardiness count" : "—"} trendDir={hasTodayData ? "down" : "flat"} />
        <MetricCard icon={Calendar} label="Total Classes" value={loading ? "—" : String(filteredRows.length)} tint="blue" trend="Active class groups" trendDir="flat" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard title="Attendance Overview" action={
          <div className="flex bg-muted/40 rounded-xl p-1">
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg ${tab === i ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        } padding="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Loading attendance data...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No attendance data found for today.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[800px]">
                <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 text-left">Class / Section</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Students</th>
                  <th className="px-4 py-3 text-left">Records</th>
                  <th className="px-4 py-3 text-left">Present</th>
                  <th className="px-4 py-3 text-left">Absent</th>
                  <th className="px-4 py-3 text-left">Attendance %</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {filteredRows.map(r => (
                    <tr key={r.label} className="border-t border-border/60 hover:bg-primary/5">
                      <td className="px-4 py-3 font-semibold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                        </div>
                        {r.label}
                      </td>
                      <td className="px-4 py-3">{r.branch}</td>
                      <td className="px-4 py-3">{r.total}</td>
                      <td className="px-4 py-3">{r.records || 0}</td>
                      <td className="px-4 py-3">{r.present}</td>
                      <td className="px-4 py-3">{r.absent}</td>
                      <td className="px-4 py-3">
                        <StatusPill tone={!hasTodayData ? "muted" : r.percentage >= 88 ? "success" : r.percentage >= 75 ? "warning" : "danger"}>
                          {hasTodayData ? `${r.percentage}%` : "—"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewing(r)} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border/60">
            <div className="text-[12px] text-muted-foreground">Showing {filteredRows.length} of {rows.length} class groups</div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Attendance Trend" subtitle="Today's snapshot">
            {!hasTodayData ? (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                No attendance recorded yet
              </div>
            ) : (
              <div className="h-[180px]">
                <ResponsiveContainer><AreaChart data={trendData}>
                  <defs><linearGradient id="aT2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="d" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aT2)" />
                </AreaChart></ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Attendance by Department">
            {!hasTodayData ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No attendance recorded yet
              </div>
            ) : deptData.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">No data yet.</div>
            ) : (
              <div className="flex items-center gap-3">
                <Donut size={130} data={deptData} center={<><div className="text-[16px] font-extrabold">{overall?.overallPercentage ?? 0}%</div><div className="text-[9.5px] text-muted-foreground">Overall</div></>} />
                <ul className="space-y-1 text-[10.5px] flex-1">
                  {deptData.map(d => (
                    <li key={d.label} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} />
                      <span>{d.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={ClipboardCheck} label="Mark Attendance" tint="emerald" onClick={() => setMarkOpen(true)} />
              <QuickActionTile icon={Upload} label="Bulk Attendance" tint="blue" onClick={() => uploadFiles("Bulk Attendance", ".csv,.xlsx")} />
              <QuickActionTile icon={FileText} label="Attendance Report" tint="amber" onClick={exportData} />
              <QuickActionTile icon={Calendar} label="Daily Summary" tint="violet" onClick={exportData} />
              <QuickActionTile icon={Bell} label="Notifications" tint="rose" onClick={() => navigate({ to: "/admin/notifications" })} />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Mark Attendance Dialog */}
      <Dialog open={markOpen} onOpenChange={setMarkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Select class, subject, and date to bulk-mark attendance (all Present by default).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarkAttendance} className="grid grid-cols-2 gap-3">
            <label className="block col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Class / Section</span>
              <select name="cls" className="cc-input mt-1">
                {rows.map(r => <option key={r.label}>{r.label}</option>)}
              </select>
            </label>
            <label className="block col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Subject</span>
              <input name="subject" placeholder="e.g. Data Structures" className="cc-input mt-1" required />
            </label>
            <label className="block col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Date</span>
              <input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="cc-input mt-1" />
            </label>
            <DialogFooter className="col-span-2">
              <button type="button" onClick={() => setMarkOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null} {saving ? "Saving..." : "Save Attendance"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={v => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.label} Attendance</DialogTitle>
            <DialogDescription>Today's attendance breakdown</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-muted-foreground">Total Students</div><div className="font-semibold">{viewing.total}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Present</div><div className="font-semibold text-emerald-600">{viewing.present}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Absent</div><div className="font-semibold text-rose-600">{viewing.absent}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Late</div><div className="font-semibold text-amber-600">{viewing.late}</div></div>
              <div className="col-span-2"><div className="text-[11px] text-muted-foreground">Attendance %</div><div className="font-semibold">{viewing.percentage}%</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Select({
  label,
  options = [],
  value,
  onChange,
}: {
  label: string;
  options?: string[];
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[180px]"
    >
      <option value="All">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
