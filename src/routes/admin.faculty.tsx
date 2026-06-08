import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { Users, UserCheck, CloudSun, Building2, BookOpen, Search, Filter, Upload, Download, Plus, Eye, Pencil, Trash2, UserPlus, GraduationCap, Calendar, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/faculty")({ component: Page });

interface Fac { id: string; name: string; email: string; dept: string; desg: string; sub: string; exp: string; status: string }

const initialRows: Fac[] = [
  { id: "FAC1001", name: "Dr. Arjun Mehta",  email: "arjun.mehta@campus.com", dept: "Computer Science", desg: "Professor",            sub: "5 Subjects", exp: "12 Years", status: "Active" },
  { id: "FAC1002", name: "Prof. Priya Sharma", email: "priya.sharma@campus.com", dept: "Information Technology", desg: "Associate Professor", sub: "4 Subjects", exp: "8 Years",  status: "Active" },
  { id: "FAC1003", name: "Dr. Rohit Verma",  email: "rohit.verma@campus.com", dept: "Mechanical Engineering", desg: "Assistant Professor", sub: "6 Subjects", exp: "6 Years",  status: "Active" },
  { id: "FAC1004", name: "Dr. Sneha Iyer",   email: "sneha.iyer@campus.com",  dept: "Electronics & Comm.",   desg: "Professor",            sub: "5 Subjects", exp: "14 Years", status: "Active" },
  { id: "FAC1005", name: "Prof. Karthik Reddy", email: "karthik.reddy@campus.com", dept: "Civil Engineering",  desg: "Associate Professor", sub: "4 Subjects", exp: "9 Years",  status: "Active" },
  { id: "FAC1006", name: "Prof. Neha Singh", email: "neha.singh@campus.com",  dept: "Electrical Engineering", desg: "Assistant Professor", sub: "3 Subjects", exp: "5 Years",  status: "On Leave" },
  { id: "FAC1007", name: "Dr. Amit Patel",   email: "amit.patel@campus.com",  dept: "Mathematics",            desg: "Associate Professor", sub: "3 Subjects", exp: "7 Years",  status: "Active" },
  { id: "FAC1008", name: "Prof. Meera Joshi",email: "meera.joshi@campus.com", dept: "Physics",                desg: "Assistant Professor", sub: "2 Subjects", exp: "4 Years",  status: "Active" },
];

const dept = [
  { label: "CSE 26% (41)", value: 41, color: "#7c3aed" },
  { label: "IT 19% (30)",  value: 30, color: "#06b6d4" },
  { label: "ME 17% (27)",  value: 27, color: "#10b981" },
  { label: "EC 15% (23)",  value: 23, color: "#f59e0b" },
  { label: "EE 12% (19)",  value: 19, color: "#ef4444" },
  { label: "Others 11% (16)", value: 16, color: "#8b5cf6" },
];
const desgBars = [
  { label: "Professor",            v: 28, pct: 18, color: "bg-violet-500" },
  { label: "Associate Professor",  v: 52, pct: 33, color: "bg-sky-500" },
  { label: "Assistant Professor",  v: 68, pct: 44, color: "bg-emerald-500" },
  { label: "Others",               v: 8,  pct: 5,  color: "bg-amber-500" },
];
const joinings = [
  { name: "Prof. Meera Joshi", date: "20 May, 2026" },
  { name: "Dr. Amit Patel",    date: "18 May, 2026" },
  { name: "Prof. Riya Kapoor", date: "15 May, 2026" },
  { name: "Dr. Suresh Nair",   date: "10 May, 2026" },
  { name: "Prof. Vikram Singh",date: "05 May, 2026" },
];

const DEPTS = ["Computer Science","Information Technology","Mechanical Engineering","Electronics & Comm.","Civil Engineering","Electrical Engineering","Mathematics","Physics"];
const DESGS = ["Professor","Associate Professor","Assistant Professor","Lecturer"];

function Page() {
  const [rows, setRows] = useState<Fac[]>(initialRows);
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Fac | null>(null);
  const [viewing, setViewing] = useState<Fac | null>(null);
  const [deleting, setDeleting] = useState<Fac | null>(null);
  const navigate = useNavigate();

  const list = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty Management" subtitle="Manage all faculty members, their departments, subjects and roles."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={() => uploadFiles("Import Faculty", ".csv,.xlsx")}>Import Faculty</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("faculty.csv", rows)}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setAddOpen(true)}>Add Faculty</PrimaryButton>
        </div>}
      />
      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email, employee ID or phone..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Select label="All Departments" /><Select label="All Designations" /><Select label="All Status" />
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard icon={Users}        label="Total Faculty"    value={String(rows.length)} tint="violet"  trend="12 this month" />
            <MetricCard icon={UserCheck}    label="Active Faculty"   value={String(rows.filter(r=>r.status==="Active").length)} tint="emerald" trend="8 this month" />
            <MetricCard icon={CloudSun}     label="On Leave"         value={String(rows.filter(r=>r.status==="On Leave").length)} tint="amber"   trend="1 this month" trendDir="down" />
            <MetricCard icon={Building2}    label="Departments"      value="14"  tint="blue"    trend="No changes" trendDir="flat" />
            <MetricCard icon={BookOpen}     label="Subjects Assigned" value="248" tint="fuchsia" trend="15 this month" />
          </div>

          <SectionCard title="All Faculty Members" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[900px]">
                <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" /></th>
                  <th className="px-4 py-3 text-left">Employee ID</th><th className="px-4 py-3 text-left">Faculty Name</th>
                  <th className="px-4 py-3 text-left">Department</th><th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-left">Subjects</th><th className="px-4 py-3 text-left">Experience</th>
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {list.map(r => (
                    <tr key={r.id} className="border-t border-border/60 hover:bg-primary/5">
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3 font-mono text-[12px] font-semibold">{r.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-white text-[11px] font-bold flex items-center justify-center">{r.name.split(" ").slice(-2).map(n=>n[0]).join("")}</div>
                          <div className="leading-tight"><div className="font-semibold">{r.name}</div><div className="text-[10.5px] text-muted-foreground">{r.email}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.dept}</td><td className="px-4 py-3">{r.desg}</td>
                      <td className="px-4 py-3">{r.sub}</td><td className="px-4 py-3">{r.exp}</td>
                      <td className="px-4 py-3"><StatusPill tone={r.status === "Active" ? "success" : "warning"}>{r.status}</StatusPill></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setViewing(r)} title="View" className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditing(r)} title="Edit" className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleting(r)} title="Delete" className="w-7 h-7 rounded-lg hover:bg-muted text-rose-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border/60">
              <div className="text-[12px] text-muted-foreground">Showing {list.length} of {rows.length} faculty members</div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Department Distribution">
            <div className="flex items-center gap-3">
              <Donut size={140} data={dept} center={<><div className="text-[18px] font-extrabold">156</div><div className="text-[10px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1.5 text-[11.5px]">{dept.map(d => (<li key={d.label} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>

          <SectionCard title="Faculty by Designation">
            <ul className="space-y-3 text-[12.5px]">
              {desgBars.map(b => (
                <li key={b.label}>
                  <div className="flex justify-between"><span>{b.label}</span><span className="font-semibold">{b.v} ({b.pct}%)</span></div>
                  <div className="h-1.5 bg-muted/50 rounded-full mt-1 overflow-hidden"><div className={`h-full ${b.color}`} style={{ width: `${b.pct*2}%` }} /></div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Recent Joinings" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-2.5 text-[12.5px]">
              {joinings.map((j, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-white text-[10px] font-bold flex items-center justify-center">{j.name.split(" ").slice(-2).map(n=>n[0]).join("")}</div>
                  <div className="flex-1 font-medium">{j.name}</div>
                  <div className="text-muted-foreground text-[11px]">{j.date}</div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={UserPlus} label="Add Faculty" tint="violet" onClick={() => setAddOpen(true)} />
              <QuickActionTile icon={GraduationCap} label="Assign Subject" tint="emerald" onClick={() => { if (rows[0]) setEditing(rows[0]); else setAddOpen(true); }} />
              <QuickActionTile icon={Calendar} label="Manage Leaves" tint="blue" onClick={() => navigate({ to: "/admin/notifications" })} />
              <QuickActionTile icon={FileText} label="Generate Report" tint="amber" onClick={() => downloadCSV("faculty-report.csv", rows)} />
            </div>
          </SectionCard>
        </div>
      </div>

      <FacultyDialog
        open={addOpen || !!editing}
        initial={editing}
        onOpenChange={(v) => { if (!v) { setAddOpen(false); setEditing(null); } }}
        onSave={(r, isEdit) => {
          if (isEdit) { setRows(rows.map(x => x.id === r.id ? r : x)); toast.success(`${r.name} updated`); }
          else { setRows([r, ...rows]); toast.success(`${r.name} added`); }
        }}
      />

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle><DialogDescription>{viewing?.id} · {viewing?.email}</DialogDescription></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info l="Department" v={viewing.dept} />
              <Info l="Designation" v={viewing.desg} />
              <Info l="Subjects" v={viewing.sub} />
              <Info l="Experience" v={viewing.exp} />
              <Info l="Status" v={viewing.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the faculty record. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) { setRows(rows.filter(r => r.id !== deleting.id)); toast.success(`${deleting.name} deleted`); setDeleting(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FacultyDialog({ open, initial, onOpenChange, onSave }: { open: boolean; initial: Fac | null; onOpenChange: (v: boolean) => void; onSave: (r: Fac, isEdit: boolean) => void }) {
  const blank: Fac = { id: "", name: "", email: "", dept: DEPTS[0], desg: DESGS[0], sub: "1 Subjects", exp: "0 Years", status: "Active" };
  const [f, setF] = useState<Fac>(initial ?? blank);
  // Reset form when opening with new initial
  const initialId = initial?.id ?? "";
  const [lastId, setLastId] = useState(initialId);
  if (open && lastId !== initialId) { setF(initial ?? blank); setLastId(initialId); }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim()) { toast.error("Name and email are required"); return; }
    const id = f.id || `FAC${Math.floor(1000 + Math.random()*9000)}`;
    onSave({ ...f, id }, !!initial);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Edit Faculty" : "Add Faculty"}</DialogTitle><DialogDescription>{initial ? "Update faculty details." : "Create a new faculty record."}</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <DField label="Full Name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="cc-input" /></DField>
          <DField label="Employee ID"><input value={f.id} onChange={e => setF({ ...f, id: e.target.value })} className="cc-input" placeholder="auto" disabled={!!initial} /></DField>
          <DField label="Email" wide><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="cc-input" /></DField>
          <DField label="Department"><select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className="cc-input">{DEPTS.map(d => <option key={d}>{d}</option>)}</select></DField>
          <DField label="Designation"><select value={f.desg} onChange={e => setF({ ...f, desg: e.target.value })} className="cc-input">{DESGS.map(d => <option key={d}>{d}</option>)}</select></DField>
          <DField label="Subjects"><input value={f.sub} onChange={e => setF({ ...f, sub: e.target.value })} className="cc-input" /></DField>
          <DField label="Experience"><input value={f.exp} onChange={e => setF({ ...f, exp: e.target.value })} className="cc-input" /></DField>
          <DField label="Status" wide><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className="cc-input"><option>Active</option><option>On Leave</option><option>Inactive</option></select></DField>
          <div className="col-span-2 mt-1">
            <DialogFooter>
              <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">{initial ? "Save Changes" : "Add Faculty"}</button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DField({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (<label className={`block ${wide ? "col-span-2" : ""}`}><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>);
}
function Info({ l, v }: { l: string; v: string }) { return (<div><div className="text-[11px] text-muted-foreground">{l}</div><div className="font-semibold">{v}</div></div>); }
function Select({ label }: { label: string }) {
  return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[150px]"><option>{label}</option></select>;
}
