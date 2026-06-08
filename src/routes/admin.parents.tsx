import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { Users, UserCheck, Clock, Link2, Users2, Search, Filter, Upload, Download, Plus, Eye, Pencil, Trash2, UserPlus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { downloadCSV, uploadFiles } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/parents")({ component: Page });

interface Parent { name: string; email: string; phone: string; relation: string; linked: string; linkedSub: string; dept: string; status: string }

const initialRows: Parent[] = [
  { name: "Ramesh Sharma",  email: "ramesh.sharma@email.com",  phone: "9876543210", relation: "Father",   linked: "2 Students", linkedSub: "Ananya Sharma, Rohan Sharma", dept: "Computer Science",    status: "Active" },
  { name: "Neha Verma",     email: "neha.verma@email.com",     phone: "9876543211", relation: "Mother",   linked: "1 Student",  linkedSub: "Priya Verma",                 dept: "Information Technology", status: "Active" },
  { name: "Suresh Nair",    email: "suresh.nair@email.com",    phone: "9876543212", relation: "Father",   linked: "1 Student",  linkedSub: "Karthik Nair",                dept: "Mechanical Engineering", status: "Active" },
  { name: "Priya Iyer",     email: "priya.iyer@email.com",     phone: "9876543213", relation: "Mother",   linked: "2 Students", linkedSub: "Sneha Iyer, Aditya Iyer",     dept: "Electronics & Comm.", status: "Active" },
  { name: "Arun Mehta",     email: "arun.mehta@email.com",     phone: "9876543214", relation: "Father",   linked: "1 Student",  linkedSub: "Arjun Mehta",                 dept: "Civil Engineering",   status: "Active" },
  { name: "Sunita Singh",   email: "sunita.singh@email.com",   phone: "9876543215", relation: "Mother",   linked: "1 Student",  linkedSub: "Neha Singh",                  dept: "Electrical Engineering", status: "Pending" },
  { name: "Vikram Reddy",   email: "vikram.reddy@email.com",   phone: "9876543216", relation: "Guardian", linked: "1 Student",  linkedSub: "Ritik Reddy",                 dept: "Computer Science",    status: "Active" },
  { name: "Meera Joshi",    email: "meera.joshi@email.com",    phone: "9876543217", relation: "Mother",   linked: "2 Students", linkedSub: "Aditi Joshi, Nikhil Joshi",   dept: "Information Technology", status: "Active" },
];

const dept = [
  { label: "CSE 26% (325)", value: 325, color: "#7c3aed" },
  { label: "IT 21% (262)",  value: 262, color: "#06b6d4" },
  { label: "ME 17% (212)",  value: 212, color: "#10b981" },
  { label: "EC 15% (187)",  value: 187, color: "#f59e0b" },
  { label: "EE 12% (149)",  value: 149, color: "#ef4444" },
  { label: "Others 9% (113)", value: 113, color: "#8b5cf6" },
];
const rel = [
  { label: "Father",   v: 598, pct: 48, color: "bg-violet-500" },
  { label: "Mother",   v: 548, pct: 44, color: "bg-pink-500" },
  { label: "Guardian", v: 75,  pct: 6,  color: "bg-sky-500" },
  { label: "Others",   v: 27,  pct: 2,  color: "bg-amber-500" },
];
const regs = [
  { name: "Amit Patel", date: "20 May, 2026" }, { name: "Ritu Kapoor", date: "20 May, 2026" },
  { name: "Rahul Verma", date: "19 May, 2026" }, { name: "Pooja Nair", date: "19 May, 2026" },
  { name: "Sanjay Reddy", date: "18 May, 2026" },
];

const DEPTS = ["Computer Science","Information Technology","Mechanical Engineering","Electronics & Comm.","Civil Engineering","Electrical Engineering"];
const RELS = ["Father","Mother","Guardian","Others"];

function Page() {
  const [rows, setRows] = useState<Parent[]>(initialRows);
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [viewing, setViewing] = useState<Parent | null>(null);
  const [deleting, setDeleting] = useState<Parent | null>(null);
  const list = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase()) || r.phone.includes(q));

  return (
    <div className="space-y-6">
      <PageHeader title="Parent Management" subtitle="Manage parent accounts and their linked students."
        action={<div className="flex gap-2">
          <GhostButton icon={Upload} onClick={() => uploadFiles("Import Parents", ".csv,.xlsx")}>Import Parents</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("parents.csv", rows)}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setAddOpen(true)}>Add Parent</PrimaryButton>
        </div>}
      />
      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by parent name, email or phone..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Select label="All Departments" /><Select label="All Relationship" /><Select label="All Status" />
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard icon={Users}     label="Total Parents"        value={String(rows.length)} tint="violet"  trend="18 this month" />
            <MetricCard icon={UserCheck} label="Active Parents"       value={String(rows.filter(r=>r.status==="Active").length)} tint="emerald" trend="15 this month" />
            <MetricCard icon={Clock}     label="Pending Verification" value={String(rows.filter(r=>r.status==="Pending").length)} tint="amber"   trend="5 this month" trendDir="down" />
            <MetricCard icon={Link2}     label="Linked to Students"   value="1,212" tint="blue"    trend="20 this month" />
            <MetricCard icon={Users2}    label="Avg. Students per Parent" value="1.45" tint="fuchsia" trend="No changes" trendDir="flat" />
          </div>

          <SectionCard title="All Parents" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[1000px]">
                <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" /></th>
                  <th className="px-4 py-3 text-left">Parent Name</th><th className="px-4 py-3 text-left">Email / Phone</th>
                  <th className="px-4 py-3 text-left">Relationship</th><th className="px-4 py-3 text-left">Linked Students</th>
                  <th className="px-4 py-3 text-left">Department</th><th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {list.map(r => (
                    <tr key={r.email} className="border-t border-border/60 hover:bg-primary/5">
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white text-[11px] font-bold flex items-center justify-center">{r.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                          <div className="font-semibold">{r.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><div className="leading-tight"><div>{r.phone}</div><div className="text-[10.5px] text-muted-foreground">{r.email}</div></div></td>
                      <td className="px-4 py-3"><StatusPill tone={r.relation === "Father" ? "info" : r.relation === "Mother" ? "warning" : "success"}>{r.relation}</StatusPill></td>
                      <td className="px-4 py-3"><div className="leading-tight"><div className="font-semibold">{r.linked}</div><div className="text-[10.5px] text-muted-foreground">{r.linkedSub}</div></div></td>
                      <td className="px-4 py-3">{r.dept}</td>
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
              <div className="text-[12px] text-muted-foreground">Showing {list.length} of {rows.length} parents</div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Department Distribution">
            <div className="flex items-center gap-3">
              <Donut size={140} data={dept} center={<><div className="text-[18px] font-extrabold">1,248</div><div className="text-[10px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1.5 text-[11.5px]">{dept.map(d => (<li key={d.label} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>

          <SectionCard title="Relationship Overview">
            <ul className="space-y-3 text-[12.5px]">
              {rel.map(b => (
                <li key={b.label}>
                  <div className="flex justify-between"><span>{b.label}</span><span className="font-semibold">{b.pct}% ({b.v})</span></div>
                  <div className="h-1.5 bg-muted/50 rounded-full mt-1 overflow-hidden"><div className={`h-full ${b.color}`} style={{ width: `${b.pct*2}%` }} /></div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Recent Parent Registrations" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-2.5 text-[12.5px]">
              {regs.map((j, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-white text-[10px] font-bold flex items-center justify-center">{j.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  <div className="flex-1 font-medium">{j.name}</div>
                  <div className="text-muted-foreground text-[11px]">{j.date}</div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={UserPlus} label="Add Parent" tint="violet" onClick={() => setAddOpen(true)} />
              <QuickActionTile icon={Link2} label="Link to Student" tint="emerald" onClick={() => { if (rows[0]) setEditing(rows[0]); else setAddOpen(true); }} />
              <QuickActionTile icon={Upload} label="Bulk Import" tint="blue" onClick={() => uploadFiles("Bulk Import Parents", ".csv")} />
              <QuickActionTile icon={FileText} label="Generate Report" tint="amber" onClick={() => downloadCSV("parents-report.csv", rows)} />
            </div>
          </SectionCard>
        </div>
      </div>

      <ParentDialog
        open={addOpen || !!editing}
        initial={editing}
        onOpenChange={(v) => { if (!v) { setAddOpen(false); setEditing(null); } }}
        onSave={(r, isEdit) => {
          if (isEdit) { setRows(rows.map(x => x.email === r.email ? r : x)); toast.success(`${r.name} updated`); }
          else {
            if (rows.some(x => x.email === r.email)) { toast.error("A parent with this email already exists"); return; }
            setRows([r, ...rows]); toast.success(`${r.name} added`);
          }
        }}
      />

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle><DialogDescription>{viewing?.email}</DialogDescription></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info l="Phone" v={viewing.phone} />
              <Info l="Relationship" v={viewing.relation} />
              <Info l="Linked Students" v={viewing.linked} />
              <Info l="Children" v={viewing.linkedSub} />
              <Info l="Department" v={viewing.dept} />
              <Info l="Status" v={viewing.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the parent record and unlink any students.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) { setRows(rows.filter(r => r.email !== deleting.email)); toast.success(`${deleting.name} deleted`); setDeleting(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ParentDialog({ open, initial, onOpenChange, onSave }: { open: boolean; initial: Parent | null; onOpenChange: (v: boolean) => void; onSave: (r: Parent, isEdit: boolean) => void }) {
  const blank: Parent = { name: "", email: "", phone: "", relation: RELS[0], linked: "0 Students", linkedSub: "", dept: DEPTS[0], status: "Active" };
  const [f, setF] = useState<Parent>(initial ?? blank);
  const initialKey = initial?.email ?? "";
  const [lastKey, setLastKey] = useState(initialKey);
  if (open && lastKey !== initialKey) { setF(initial ?? blank); setLastKey(initialKey); }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim()) { toast.error("Name, email and phone are required"); return; }
    onSave(f, !!initial);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Edit Parent" : "Add Parent"}</DialogTitle><DialogDescription>{initial ? "Update parent details." : "Create a new parent account."}</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <DField label="Full Name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="cc-input" /></DField>
          <DField label="Phone"><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="cc-input" /></DField>
          <DField label="Email" wide><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="cc-input" disabled={!!initial} /></DField>
          <DField label="Relationship"><select value={f.relation} onChange={e => setF({ ...f, relation: e.target.value })} className="cc-input">{RELS.map(r => <option key={r}>{r}</option>)}</select></DField>
          <DField label="Department"><select value={f.dept} onChange={e => setF({ ...f, dept: e.target.value })} className="cc-input">{DEPTS.map(d => <option key={d}>{d}</option>)}</select></DField>
          <DField label="Linked Students (e.g. 1 Student)"><input value={f.linked} onChange={e => setF({ ...f, linked: e.target.value })} className="cc-input" /></DField>
          <DField label="Status"><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className="cc-input"><option>Active</option><option>Pending</option><option>Inactive</option></select></DField>
          <DField label="Children Names" wide><input value={f.linkedSub} onChange={e => setF({ ...f, linkedSub: e.target.value })} className="cc-input" placeholder="Comma separated" /></DField>
          <div className="col-span-2 mt-1">
            <DialogFooter>
              <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">{initial ? "Save Changes" : "Add Parent"}</button>
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
function Select({ label }: { label: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[150px]"><option>{label}</option></select>; }
