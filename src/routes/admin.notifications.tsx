import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill } from "@/components/admin-ui";
import { Bell, Send, Eye, Clock, FileEdit, Upload, Download, Plus, Filter, Pencil, MoreVertical, Megaphone, Calendar, BookOpen, Trophy, FileText, AlertTriangle, GraduationCap, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV, importTableFile } from "@/lib/files";

export const Route = createFileRoute("/admin/notifications")({ component: Page });

type Notif = { icon: any; tint: string; title: string; sub: string; cat: string; catTone: string; rec: string; dept: string; status: "Sent" | "Scheduled" | "Draft"; statusTone: string; time: string; rate: number | null };

const catIcon: Record<string, any> = { Announcement: Megaphone, Academics: Calendar, Event: Trophy, General: Bell, Finance: FileText, Placement: GraduationCap, Alert: AlertTriangle };
const catTint: Record<string, { tint: string; cat: string }> = {
  Announcement: { tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300", cat: "info" },
  Academics:    { tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300", cat: "success" },
  Event:        { tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300", cat: "warning" },
  General:      { tint: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300", cat: "muted" },
  Finance:      { tint: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300", cat: "success" },
  Placement:    { tint: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300", cat: "info" },
  Alert:        { tint: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300", cat: "danger" },
};

const initial: Notif[] = [
  { icon: Megaphone, tint: catTint.Announcement.tint, title: "Semester Break Announcement", sub: "College will remain closed from 1st...", cat: "Announcement", catTone: "info", rec: "All Students", dept: "All Departments", status: "Sent", statusTone: "success", time: "30 May 2026\n10:00 AM", rate: 92.45 },
  { icon: Calendar, tint: catTint.Academics.tint, title: "Internal Exam Schedule", sub: "Internal examinations start from...", cat: "Academics", catTone: "success", rec: "Students", dept: "All Departments", status: "Sent", statusTone: "success", time: "29 May 2026\n02:30 PM", rate: 88.13 },
  { icon: Trophy, tint: catTint.Event.tint, title: "Annual Sports Meet 2026", sub: "Sports event will be held from...", cat: "Event", catTone: "warning", rec: "Students, Parents", dept: "All Departments", status: "Sent", statusTone: "success", time: "28 May 2026\n11:00 AM", rate: 85.76 },
  { icon: Bell, tint: catTint.General.tint, title: "Library Timings Updated", sub: "New library timings are now in effect.", cat: "General", catTone: "muted", rec: "All Students", dept: "Library", status: "Sent", statusTone: "success", time: "27 May 2026\n05:15 PM", rate: 78.20 },
  { icon: FileText, tint: catTint.Finance.tint, title: "Fee Payment Reminder", sub: "This is a reminder to pay your...", cat: "Finance", catTone: "success", rec: "Students, Parents", dept: "Finance", status: "Scheduled", statusTone: "warning", time: "01 Jun 2026\n09:00 AM", rate: null },
  { icon: GraduationCap, tint: catTint.Placement.tint, title: "Placement Drive Registration", sub: "Register now for the upcoming...", cat: "Placement", catTone: "info", rec: "Final Year Students", dept: "Placement Cell", status: "Scheduled", statusTone: "warning", time: "02 Jun 2026\n10:00 AM", rate: null },
  { icon: AlertTriangle, tint: catTint.Alert.tint, title: "System Maintenance Notice", sub: "Our portal will be under maintenance...", cat: "Alert", catTone: "danger", rec: "All Users", dept: "IT Department", status: "Draft", statusTone: "muted", time: "-", rate: null },
  { icon: BookOpen, tint: catTint.Academics.tint, title: "New Course Available", sub: "A new certification course is now...", cat: "Academics", catTone: "success", rec: "Students", dept: "All Departments", status: "Draft", statusTone: "muted", time: "-", rate: null },
];

const summary = [
  { label: "Announcement 42% (524)", value: 524, color: "#7c3aed" },
  { label: "Academics 25% (312)",    value: 312, color: "#10b981" },
  { label: "Event 15% (187)",        value: 187, color: "#f59e0b" },
  { label: "General 10% (125)",      value: 125, color: "#ec4899" },
  { label: "Others 8% (100)",        value: 100, color: "#3b82f6" },
];

function Page() {
  const [rows, setRows] = useState<Notif[]>(initial);
  const [open, setOpen] = useState<{ mode: "create" | "edit"; row?: Notif } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const sub = String(fd.get("sub") || "");
    const cat = String(fd.get("cat") || "Announcement");
    const rec = String(fd.get("rec") || "All Students");
    const dept = String(fd.get("dept") || "All Departments");
    const status = String(fd.get("status") || "Sent") as "Sent" | "Scheduled" | "Draft";
    if (!title) return;
    const meta = catTint[cat] ?? catTint.Announcement;
    const next: Notif = {
      icon: catIcon[cat] ?? Megaphone, tint: meta.tint, title, sub, cat, catTone: meta.cat,
      rec, dept, status,
      statusTone: status === "Sent" ? "success" : status === "Scheduled" ? "warning" : "muted",
      time: status === "Draft" ? "-" : new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "\n"),
      rate: status === "Sent" ? Number((80 + Math.random() * 15).toFixed(2)) : null,
    };
    if (open?.mode === "edit" && open.row) {
      setRows(prev => prev.map(r => r.title === open.row!.title ? next : r));
      toast.success(`"${title}" updated`);
    } else {
      setRows(prev => [next, ...prev]);
      toast.success(`Notification "${title}" ${status === "Draft" ? "saved as draft" : status === "Scheduled" ? "scheduled" : "sent"}`);
    }
    setOpen(null);
  };

  const remove = (t: string) => { setRows(prev => prev.filter(r => r.title !== t)); toast.success("Notification deleted"); };
  const publish = (t: string) => { setRows(prev => prev.map(r => r.title === t ? { ...r, status: "Sent", statusTone: "success", rate: Number((80 + Math.random() * 15).toFixed(2)), time: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "\n") } : r)); toast.success("Notification published"); };

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Management" subtitle="Create, manage and track all notifications across the campus."
        action={<div className="flex gap-2 flex-wrap">
          <GhostButton icon={Upload} onClick={async () => { const r = await importTableFile("Notifications", ".csv,.xlsx"); if (r?.rows?.length) toast.success(`${r.rows.length} rows imported`); }}>Import Notifications</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("notifications.csv", rows.map(({ icon, tint, ...r }) => r))}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setOpen({ mode: "create" })}>Create New Notification</PrimaryButton>
        </div>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Bell}     label="Total Notifications" value={String(1240 + rows.length - initial.length)} tint="violet"  trend="24.35% this month" />
        <MetricCard icon={Send}     label="Sent Notifications"  value={String(1080 + rows.filter(r => r.status === "Sent").length - initial.filter(r => r.status === "Sent").length)} tint="emerald" trend="20.18% this month" />
        <MetricCard icon={Eye}      label="Read / Opened"       value="892"   tint="amber"   trend="18.32% this month" />
        <MetricCard icon={Clock}    label="Scheduled"           value={String(rows.filter(r => r.status === "Scheduled").length + 34)}    tint="rose"    trend="8.33% this month" trendDir="down" />
        <MetricCard icon={FileEdit} label="Drafts"              value={String(rows.filter(r => r.status === "Draft").length + 32)}    tint="blue"    trend="No changes" trendDir="flat" />
      </div>

      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background">
          <input placeholder="Search notifications by title or content..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Sel l="All Categories" /><Sel l="All Recipients" /><Sel l="All Statuses" /><Sel l="All Departments" />
        <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background text-sm"><Calendar className="w-4 h-4 text-muted-foreground" />May 24 – May 30, 2026</div>
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <SectionCard title="All Notifications" padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 text-left w-8"><input type="checkbox" /></th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Recipients</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Sent / Scheduled</th>
                <th className="px-4 py-3 text-left">Read Rate</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>{rows.map((n,i) => (
                <tr key={i} className="border-t border-border/60 hover:bg-primary/5">
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.tint}`}><n.icon className="w-4 h-4" /></div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">{n.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusPill tone={n.catTone as any}>{n.cat}</StatusPill></td>
                  <td className="px-4 py-3 text-foreground/80 text-[12px]">{n.rec}</td>
                  <td className="px-4 py-3 text-foreground/80 text-[12px]">{n.dept}</td>
                  <td className="px-4 py-3"><StatusPill tone={n.statusTone as any}>{n.status}</StatusPill></td>
                  <td className="px-4 py-3 text-muted-foreground text-[11.5px] whitespace-pre-line">{n.time}</td>
                  <td className="px-4 py-3">
                    {n.rate !== null ? (
                      <div className="min-w-[80px]">
                        <div className="text-[12px] font-semibold mb-1">{n.rate}%</div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${n.rate}%` }} /></div>
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => toast(n.title, { description: n.sub })} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setOpen({ mode: "edit", row: n })} className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                    {n.status !== "Sent" && <button onClick={() => publish(n.title)} className="w-7 h-7 rounded-lg hover:bg-muted text-emerald-600 flex items-center justify-center" title="Publish"><Send className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => remove(n.title)} className="w-7 h-7 rounded-lg hover:bg-muted text-rose-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground flex items-center justify-center"><MoreVertical className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Notification Summary">
            <div className="flex items-center gap-3">
              <Donut size={130} data={summary} center={<><div className="text-[14px] font-extrabold">1,248</div><div className="text-[9.5px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1 text-[10.5px] flex-1">{summary.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              {[{i:Megaphone,l:"Create Notification",t:"violet",fn:() => setOpen({ mode: "create" })},{i:Clock,l:"Schedule Notification",t:"amber",fn:() => setOpen({ mode: "create" })},{i:FileText,l:"Notification Templates",t:"blue",fn:() => toast("Templates", { description: "4 default templates available" })},{i:Settings,l:"Settings & Preferences",t:"fuchsia",fn:() => toast("Notification settings opened")}].map((a,i)=>(
                <button key={i} onClick={a.fn} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors">
                  <a.i className="w-5 h-5 text-primary" /><span className="text-[10.5px] font-semibold text-foreground/80 text-center leading-tight">{a.l}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{open?.mode === "edit" ? "Edit Notification" : "Create New Notification"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Title</span><input name="title" required defaultValue={open?.row?.title} className="cc-input mt-1" placeholder="e.g. Holiday Notice" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Message</span><textarea name="sub" defaultValue={open?.row?.sub} className="cc-input mt-1 min-h-[80px]" placeholder="Notification body" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Category</span>
                <select name="cat" defaultValue={open?.row?.cat} className="cc-input mt-1">{Object.keys(catTint).map(o => <option key={o}>{o}</option>)}</select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Status</span>
                <select name="status" defaultValue={open?.row?.status ?? "Sent"} className="cc-input mt-1"><option>Sent</option><option>Scheduled</option><option>Draft</option></select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Recipients</span><input name="rec" defaultValue={open?.row?.rec ?? "All Students"} className="cc-input mt-1" /></label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Department</span><input name="dept" defaultValue={open?.row?.dept ?? "All Departments"} className="cc-input mt-1" /></label>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">{open?.mode === "edit" ? "Save" : "Create"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Sel({ l }: { l: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[140px]"><option>{l}</option></select>; }
