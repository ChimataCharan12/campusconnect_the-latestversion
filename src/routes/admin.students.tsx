import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, Legend, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { Users, UserCheck, Clock, Building2, Search, Filter, Upload, Download, Plus, Eye, Pencil, Trash2, UserPlus, TrendingUp, FileText } from "lucide-react";
import { useState } from "react";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/students")({ component: Page });

const dept = [
  { label: "CSE 35% (857)", value: 857, color: "#7c3aed" },
  { label: "IT 20% (490)",  value: 490, color: "#06b6d4" },
  { label: "ME 15% (368)",  value: 368, color: "#f59e0b" },
  { label: "EC 12% (294)",  value: 294, color: "#ef4444" },
  { label: "EE 10% (245)",  value: 245, color: "#10b981" },
  { label: "CE 8% (196)",   value: 196, color: "#8b5cf6" },
];

const rows = [
  { roll: "23CSE001", name: "Ananya Sharma",   email: "ananya@campus.com",  dept: "Computer Science",    year: "3rd Year", sec: "A", att: 92.45, cgpa: 8.76, status: "Active" },
  { roll: "23CSE002", name: "Rohan Verma",     email: "rohan@campus.com",   dept: "Computer Science",    year: "3rd Year", sec: "A", att: 88.12, cgpa: 8.32, status: "Active" },
  { roll: "23IT003",  name: "Priya Nair",      email: "priya@campus.com",   dept: "Information Technology", year: "2nd Year", sec: "B", att: 91.23, cgpa: 8.91, status: "Active" },
  { roll: "23ME004",  name: "Karthik Reddy",   email: "karthik@campus.com", dept: "Mechanical Engineering", year: "3rd Year", sec: "C", att: 85.67, cgpa: 7.95, status: "Active" },
  { roll: "23EC005",  name: "Sneha Iyer",      email: "sneha@campus.com",   dept: "Electronics & Comm.", year: "2nd Year", sec: "A", att: 89.35, cgpa: 8.28, status: "Active" },
  { roll: "23CE006",  name: "Arjun Mehta",     email: "arjun@campus.com",   dept: "Civil Engineering",   year: "4th Year", sec: "A", att: 93.12, cgpa: 8.67, status: "Active" },
  { roll: "23EE007",  name: "Neha Singh",      email: "neha@campus.com",    dept: "Electrical Engineering", year: "3rd Year", sec: "B", att: 78.45, cgpa: 7.12, status: "Inactive" },
  { roll: "23CS008",  name: "Aditya Patil",    email: "aditya@campus.com",  dept: "Computer Science",    year: "2nd Year", sec: "C", att: 90.18, cgpa: 8.45, status: "Active" },
];

const top = [
  { rank: "🏆", name: "Ananya Sharma", v: "9.32" },
  { rank: "2", name: "Priya Nair", v: "9.15" },
  { rank: "🥉", name: "Arjun Mehta", v: "9.08" },
  { rank: "4", name: "Karthik Reddy", v: "8.91" },
  { rank: "5", name: "Rohan Verma", v: "8.76" },
];

function Page() {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [extraRows, setExtraRows] = useState<typeof rows>([]);
  const [removedRolls, setRemovedRolls] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, (typeof rows)[number]>>({});
  const [viewing, setViewing] = useState<(typeof rows)[number] | null>(null);
  const [editing, setEditing] = useState<(typeof rows)[number] | null>(null);
  const [deleting, setDeleting] = useState<(typeof rows)[number] | null>(null);
  const allRows = [...extraRows, ...rows].filter(r => !removedRolls.includes(r.roll)).map(r => edits[r.roll] ?? r);
  const list = allRows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Student Management" subtitle="Manage all students across departments and years."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={() => uploadFiles("Import Students", ".csv,.xlsx")}>Import Students</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("students.csv", rows)}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setAddOpen(true)}>Add Student</PrimaryButton>
        </div>}
      />

      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, roll no., email or phone..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Select label="All Departments" />
        <Select label="All Years" />
        <Select label="All Sections" />
        <Select label="All Status" />
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Users}      label="Total Students"       value="2,450" tint="violet"  trend="12 this month" />
            <MetricCard icon={UserCheck}  label="Active Students"      value="2,385" tint="emerald" trend="10 this month" />
            <MetricCard icon={Clock}      label="Pending Verification" value="42"    tint="amber"   trend="5 this month" trendDir="down" />
            <MetricCard icon={Building2}  label="Departments"          value="8"     tint="blue"    trend="No changes" trendDir="flat" />
          </div>

          <SectionCard title="All Students" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[900px]">
                <thead>
                  <tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                    <th className="px-4 py-3 text-left w-10"><input type="checkbox" /></th>
                    <th className="px-4 py-3 text-left">Roll No.</th>
                    <th className="px-4 py-3 text-left">Student Name</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-left">Section</th>
                    <th className="px-4 py-3 text-left">Attendance</th>
                    <th className="px-4 py-3 text-left">CGPA</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r, i) => (
                    <tr key={r.roll} className={`border-t border-border/60 hover:bg-primary/5 ${i === 0 ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3 font-mono text-[12px] font-semibold">{r.roll}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white text-[11px] font-bold flex items-center justify-center">{r.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                          <div className="leading-tight"><div className="font-semibold">{r.name}</div><div className="text-[10.5px] text-muted-foreground">{r.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.dept}</td>
                      <td className="px-4 py-3">{r.year}</td>
                      <td className="px-4 py-3">{r.sec}</td>
                      <td className="px-4 py-3"><StatusPill tone={r.att >= 85 ? "success" : r.att >= 75 ? "warning" : "danger"}>{r.att}%</StatusPill></td>
                      <td className="px-4 py-3"><StatusPill tone={r.cgpa >= 8 ? "success" : r.cgpa >= 7.5 ? "warning" : "danger"}>{r.cgpa}</StatusPill></td>
                      <td className="px-4 py-3"><StatusPill tone={r.status === "Active" ? "success" : "danger"}>{r.status}</StatusPill></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <IconBtn icon={Eye} tint="text-sky-600" title="View" onClick={() => setViewing(r)} />
                          <IconBtn icon={Pencil} tint="text-amber-600" title="Edit" onClick={() => setEditing(r)} />
                          <IconBtn icon={Trash2} tint="text-rose-600" title="Delete" onClick={() => setDeleting(r)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border/60">
              <div className="text-[12px] text-muted-foreground">Showing 1 to 8 of 2,450 students</div>
              <Pagination />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Department Distribution">
            <div className="flex items-center gap-3">
              <Donut size={140} data={dept} center={<><div className="text-[18px] font-extrabold">2,450</div><div className="text-[10px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1.5 text-[11.5px]">
                {dept.map(d => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span>{d.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>

          <SectionCard title="Attendance Overview">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-muted-foreground">Overall Attendance</div>
                <div className="text-3xl font-extrabold">89.24%</div>
                <div className="text-[11px] text-emerald-600 font-semibold">↑ 3.45% this month</div>
              </div>
              <Donut size={90} thickness={14}
                data={[{ label: "Present", value: 89, color: "#10b981" }, { label: "rest", value: 11, color: "#e5e7eb" }]}
                center={null}
              />
            </div>
            <div className="mt-4 space-y-2 text-[12px]">
              <Bar label="Present" value="2,188" color="bg-emerald-500" pct={89} />
              <Bar label="Absent"  value="212"   color="bg-rose-500"    pct={9} />
              <Bar label="Late"    value="50"    color="bg-amber-500"   pct={2} />
            </div>
          </SectionCard>

          <SectionCard title="Top Performers" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-2.5 text-[12.5px]">
              {top.map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 text-center">{t.rank}</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{t.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  <div className="flex-1 font-medium">{t.name}</div>
                  <div className="font-bold">{t.v}</div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={UserPlus} label="Add Student" tint="violet" onClick={() => setAddOpen(true)} />
              <QuickActionTile icon={TrendingUp} label="Promote Students" tint="emerald" onClick={() => setPromoteOpen(true)} />
              <QuickActionTile icon={FileText} label="Generate Report" tint="amber" onClick={() => downloadCSV("students-report.csv", rows)} />
              <QuickActionTile icon={Download} label="Export List" tint="orange" onClick={() => downloadCSV("students-list.csv", list)} />
            </div>
          </SectionCard>
        </div>
      </div>

      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onAdd={(r) => setExtraRows([r, ...extraRows])} />
      <PromoteDialog open={promoteOpen} onOpenChange={setPromoteOpen} />

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle><DialogDescription>{viewing?.roll} · {viewing?.email}</DialogDescription></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-muted-foreground">Department</div><div className="font-semibold">{viewing.dept}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Year / Section</div><div className="font-semibold">{viewing.year} / {viewing.sec}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Attendance</div><div className="font-semibold">{viewing.att}%</div></div>
              <div><div className="text-[11px] text-muted-foreground">CGPA</div><div className="font-semibold">{viewing.cgpa}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Status</div><div className="font-semibold">{viewing.status}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle><DialogDescription>Update student details.</DialogDescription></DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const updated = {
                  ...editing,
                  name: String(fd.get("name") || editing.name),
                  email: String(fd.get("email") || editing.email),
                  dept: String(fd.get("dept") || editing.dept),
                  year: String(fd.get("year") || editing.year),
                  sec: String(fd.get("sec") || editing.sec),
                  att: Number(fd.get("att") || editing.att),
                  cgpa: Number(fd.get("cgpa") || editing.cgpa),
                  status: String(fd.get("status") || editing.status),
                };
                setEdits({ ...edits, [editing.roll]: updated });
                toast.success(`${updated.name} updated`);
                setEditing(null);
              }}
              className="grid grid-cols-2 gap-3"
            >
              <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Name</span><input name="name" defaultValue={editing.name} className="cc-input mt-1" /></label>
              <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Email</span><input name="email" type="email" defaultValue={editing.email} className="cc-input mt-1" /></label>
              <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Department</span>
                <select name="dept" defaultValue={editing.dept} className="cc-input mt-1">
                  <option>Computer Science</option><option>Information Technology</option><option>Mechanical Engineering</option><option>Electronics & Comm.</option><option>Civil Engineering</option><option>Electrical Engineering</option>
                </select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Year</span>
                <select name="year" defaultValue={editing.year} className="cc-input mt-1">{["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}</select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Section</span>
                <select name="sec" defaultValue={editing.sec} className="cc-input mt-1">{["A","B","C","D"].map(s => <option key={s}>{s}</option>)}</select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Attendance %</span><input name="att" type="number" step="0.01" defaultValue={editing.att} className="cc-input mt-1" /></label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">CGPA</span><input name="cgpa" type="number" step="0.01" defaultValue={editing.cgpa} className="cc-input mt-1" /></label>
              <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Status</span>
                <select name="status" defaultValue={editing.status} className="cc-input mt-1"><option>Active</option><option>Inactive</option></select>
              </label>
              <div className="col-span-2"><DialogFooter>
                <button type="button" onClick={() => setEditing(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
                <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Save Changes</button>
              </DialogFooter></div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {deleting?.name}?</DialogTitle><DialogDescription>This will remove the student record. This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <button onClick={() => setDeleting(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
            <button onClick={() => { if (deleting) { setRemovedRolls([...removedRolls, deleting.roll]); toast.success(`${deleting.name} deleted`); setDeleting(null); } }} className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddStudentDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (v: boolean) => void; onAdd: (r: (typeof rows)[number]) => void }) {
  const [f, setF] = useState({ roll: "", name: "", email: "", dept: "Computer Science", year: "1st Year", sec: "A" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.roll.trim() || !f.name.trim() || !f.email.trim()) { toast.error("Roll, name and email are required"); return; }
    onAdd({ ...f, att: 0, cgpa: 0, status: "Active" });
    toast.success(`${f.name} added`);
    setF({ roll: "", name: "", email: "", dept: "Computer Science", year: "1st Year", sec: "A" });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>Create a new student record. They will appear in the list immediately.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <DField label="Roll No."><input value={f.roll} onChange={e => setF({ ...f, roll: e.target.value })} className="cc-input" placeholder="e.g. 25CSE001" /></DField>
          <DField label="Full Name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="cc-input" /></DField>
          <DField label="Email" wide><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="cc-input" /></DField>
          <DField label="Department">
            <select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className="cc-input">
              <option>Computer Science</option><option>Information Technology</option><option>Mechanical Engineering</option><option>Electronics & Comm.</option><option>Civil Engineering</option><option>Electrical Engineering</option>
            </select>
          </DField>
          <DField label="Year">
            <select value={f.year} onChange={e => setF({ ...f, year: e.target.value })} className="cc-input">
              {["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}
            </select>
          </DField>
          <DField label="Section">
            <select value={f.sec} onChange={e => setF({ ...f, sec: e.target.value })} className="cc-input">
              {["A","B","C","D"].map(s => <option key={s}>{s}</option>)}
            </select>
          </DField>
          <div className="col-span-2 mt-1">
            <DialogFooter>
              <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Add Student</button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PromoteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [from, setFrom] = useState("2nd Year");
  const [to, setTo] = useState("3rd Year");
  const [running, setRunning] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast.success(`Promoted ${from} students to ${to}`);
      onOpenChange(false);
    }, 700);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>Move a cohort to the next academic year.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <DField label="From Year">
            <select value={from} onChange={e => setFrom(e.target.value)} className="cc-input">
              {["1st Year","2nd Year","3rd Year"].map(y => <option key={y}>{y}</option>)}
            </select>
          </DField>
          <DField label="To Year">
            <select value={to} onChange={e => setTo(e.target.value)} className="cc-input">
              {["2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}
            </select>
          </DField>
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" disabled={running} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet disabled:opacity-60">{running ? "Promoting..." : "Promote"}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DField({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Select({ label }: { label: string }) {
  return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[150px]"><option>{label}</option></select>;
}
function IconBtn({ icon: Icon, tint, title, onClick }: { icon: any; tint: string; title?: string; onClick?: () => void }) {
  return <button onClick={onClick} title={title} className={`w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center ${tint}`}><Icon className="w-3.5 h-3.5" /></button>;
}
function Bar({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
function Pagination() {
  return (
    <div className="flex items-center gap-1">
      <button className="w-8 h-8 rounded-lg border border-border hover:bg-muted text-sm">‹</button>
      {[1,2,3,4,5].map(n => (
        <button key={n} className={`w-8 h-8 rounded-lg text-sm font-semibold ${n===1 ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" : "hover:bg-muted"}`}>{n}</button>
      ))}
      <span className="px-1 text-muted-foreground">...</span>
      <button className="w-10 h-8 rounded-lg hover:bg-muted text-sm">306</button>
      <button className="w-8 h-8 rounded-lg border border-border hover:bg-muted text-sm">›</button>
      <select className="ml-2 h-8 px-2 rounded-lg border border-border bg-background text-xs"><option>10 / page</option></select>
    </div>
  );
}
