import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, Donut, PageToolbar, PrimaryButton, GhostButton, StatusPill, QuickActionTile } from "@/components/admin-ui";
import { MapPin, CheckCircle2, Building2, Camera, Upload, Download, Plus, Filter, Eye, Pencil, Trash2, MapPinned, Map, BarChart3, UserPlus, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV, importTableFile, uploadFiles } from "@/lib/files";

export const Route = createFileRoute("/admin/navigation")({ component: Page });

type Loc = { name: string; type: string; tone: string; build: string; floor: string; status: "Active" | "Inactive"; date: string };

const initial: Loc[] = [
  { name: "Main Academic Block", type: "Building", tone: "info",    build: "Academic Block", floor: "All Floors",  status: "Active",   date: "28 May 2026" },
  { name: "Computer Lab 1",      type: "Room",     tone: "success", build: "Academic Block", floor: "1st Floor",   status: "Active",   date: "27 May 2026" },
  { name: "Cafeteria",           type: "Facility", tone: "warning", build: "Main Block",     floor: "Ground Floor", status: "Active",   date: "26 May 2026" },
  { name: "Washroom (Male)",     type: "Facility", tone: "warning", build: "Main Block",     floor: "Ground Floor", status: "Active",   date: "26 May 2026" },
  { name: "Central Library",     type: "Building", tone: "info",    build: "Library Block",  floor: "All Floors",  status: "Active",   date: "25 May 2026" },
  { name: "Seminar Hall",        type: "Room",     tone: "success", build: "Seminar Block",  floor: "2nd Floor",   status: "Inactive", date: "24 May 2026" },
  { name: "Basketball Court",    type: "Facility", tone: "warning", build: "Sports Complex", floor: "Ground Floor", status: "Active",   date: "24 May 2026" },
  { name: "Parking Area A",      type: "Facility", tone: "warning", build: "Parking Zone",   floor: "Ground Floor", status: "Active",   date: "23 May 2026" },
];

const distribution = [
  { label: "Buildings 32 (12.90%)",         value: 32,  color: "#7c3aed" },
  { label: "Rooms 86 (34.68%)",             value: 86,  color: "#3b82f6" },
  { label: "Facilities 78 (31.45%)",        value: 78,  color: "#f59e0b" },
  { label: "Navigation Points 52 (20.97%)", value: 52,  color: "#ec4899" },
];

function Page() {
  const [locations, setLocations] = useState<Loc[]>(initial);
  const [open, setOpen] = useState<{ mode: "add" | "edit"; initial?: Loc } | null>(null);
  const [defaultType, setDefaultType] = useState<string>("Building");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const type = String(fd.get("type") || "Building");
    const build = String(fd.get("build") || "");
    const floor = String(fd.get("floor") || "");
    const status = (String(fd.get("status") || "Active")) as "Active" | "Inactive";
    if (!name) return;
    const toneMap: Record<string,string> = { Building: "info", Room: "success", Facility: "warning", "Nav Point": "info" };
    const next: Loc = { name, type, tone: toneMap[type] ?? "info", build, floor, status, date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) };
    if (open?.mode === "edit" && open.initial) {
      setLocations(prev => prev.map(l => l.name === open.initial!.name ? next : l));
      toast.success(`${name} updated`);
    } else {
      setLocations(prev => [next, ...prev]);
      toast.success(`${name} added`);
    }
    setOpen(null);
  };

  const remove = (n: string) => { setLocations(prev => prev.filter(l => l.name !== n)); toast.success(`${n} deleted`); };
  const openAdd = (t: string) => { setDefaultType(t); setOpen({ mode: "add" }); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Navigation"
        subtitle="Manage campus locations, maps, and navigation points for the smart campus."
        action={<div className="flex gap-2 flex-wrap">
          <GhostButton icon={Upload} onClick={async () => { const r = await importTableFile("Locations", ".csv,.xlsx"); if (r?.rows?.length) toast.success(`${r.rows.length} rows imported`); }}>Import Locations</GhostButton>
          <GhostButton icon={Download} onClick={() => downloadCSV("locations.csv", locations)}>Export Data</GhostButton>
          <PrimaryButton icon={Plus} onClick={() => openAdd("Building")}>Add New Location</PrimaryButton>
        </div>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={MapPin}      label="Total Locations"    value={String(240 + locations.length - initial.length)} tint="violet"  trend="18 this month" />
        <MetricCard icon={CheckCircle2} label="Active Locations"  value={String(locations.filter(l => l.status === "Active").length + 212)} tint="emerald" trend="15 this month" />
        <MetricCard icon={Building2}   label="Buildings"          value={String(locations.filter(l => l.type === "Building").length + 28)}  tint="amber"   trend="3 this month" />
        <MetricCard icon={MapPinned}   label="Navigation Points"  value="586" tint="rose"    trend="42 this month" />
        <MetricCard icon={Map}         label="Maps Published"     value="18"  tint="blue"    trend="No changes" trendDir="flat" />
      </div>

      <PageToolbar>
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-background">
          <input placeholder="Search locations, buildings..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Sel l="All Location Types" /><Sel l="All Buildings" /><Sel l="All Status" />
        <GhostButton icon={Filter}>Filters</GhostButton>
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <SectionCard padding="p-0">
          <div className="flex gap-1 px-6 border-b border-border/60">
            {["All Locations","Buildings","Navigation Points","Maps"].map((t,i)=>(<button key={t} className={`px-3 py-3 text-[12.5px] font-semibold ${i===0?"text-primary border-b-2 border-primary":"text-muted-foreground"}`}>{t}</button>))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead><tr className="text-[11px] uppercase text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 text-left w-8"><input type="checkbox" /></th>
                <th className="px-4 py-3 text-left">Location Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Building</th>
                <th className="px-4 py-3 text-left">Floor / Level</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Added On</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>{locations.map(l => (
                <tr key={l.name} className="border-t border-border/60 hover:bg-primary/5">
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 font-semibold flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center"><MapPin className="w-3.5 h-3.5" /></div>{l.name}</td>
                  <td className="px-4 py-3"><StatusPill tone={l.tone as any}>{l.type}</StatusPill></td>
                  <td className="px-4 py-3 text-foreground/80">{l.build}</td>
                  <td className="px-4 py-3 text-foreground/80">{l.floor}</td>
                  <td className="px-4 py-3"><StatusPill tone={l.status==="Active"?"success":"danger"}>{l.status}</StatusPill></td>
                  <td className="px-4 py-3 text-muted-foreground text-[12px]">{l.date}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => toast(l.name, { description: `${l.type} · ${l.build} · ${l.floor}` })} className="w-7 h-7 rounded-lg hover:bg-muted text-sky-600 flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setOpen({ mode: "edit", initial: l })} className="w-7 h-7 rounded-lg hover:bg-muted text-amber-600 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(l.name)} className="w-7 h-7 rounded-lg hover:bg-muted text-rose-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-border/60">
            <div className="text-[12px] text-muted-foreground">Showing 1 to {locations.length} of {240 + locations.length - initial.length} locations</div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Campus Map Overview" action={<a className="text-[12px] font-semibold text-primary">View Map →</a>}>
            <div className="relative h-[150px] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-sky-100 dark:from-emerald-900/30 dark:via-card dark:to-sky-900/30">
              {[{l:25,t:30},{l:55,t:20},{l:70,t:55},{l:35,t:65},{l:85,t:40},{l:18,t:75}].map((p,i)=>(<MapPin key={i} className="w-5 h-5 absolute text-primary drop-shadow" style={{left:`${p.l}%`,top:`${p.t}%`}} />))}
            </div>
          </SectionCard>

          <SectionCard title="Location Type Distribution">
            <div className="flex items-center gap-3">
              <Donut size={130} data={distribution} center={<><div className="text-[14px] font-extrabold">248</div><div className="text-[9.5px] text-muted-foreground">Total</div></>} />
              <ul className="space-y-1.5 text-[10.5px] flex-1">{distribution.map(d => (<li key={d.label} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} /><span>{d.label}</span></li>))}</ul>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile icon={UserPlus} label="Add Location" tint="violet" onClick={() => openAdd("Building")} />
              <QuickActionTile icon={Building2} label="Add Building" tint="blue" onClick={() => openAdd("Building")} />
              <QuickActionTile icon={Plus} label="Add Room" tint="emerald" onClick={() => openAdd("Room")} />
              <QuickActionTile icon={Camera} label="Add Facility" tint="orange" onClick={() => openAdd("Facility")} />
              <QuickActionTile icon={MapPinned} label="Add Nav Point" tint="rose" onClick={() => openAdd("Nav Point")} />
              <QuickActionTile icon={Upload} label="Upload Map" tint="amber" onClick={() => uploadFiles("Campus Map", ".png,.jpg,.pdf,.svg")} />
              <QuickActionTile icon={FileImage} label="Manage Maps" tint="fuchsia" onClick={() => toast("Maps", { description: "18 maps published" })} />
              <QuickActionTile icon={BarChart3} label="View Analytics" tint="cyan" onClick={() => downloadCSV("location-analytics.csv", locations)} />
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{open?.mode === "edit" ? `Edit ${open.initial?.name}` : "Add New Location"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Location Name</span><input name="name" required defaultValue={open?.initial?.name} className="cc-input mt-1" placeholder="e.g. Physics Lab" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Type</span>
                <select name="type" defaultValue={open?.initial?.type ?? defaultType} className="cc-input mt-1">
                  {["Building","Room","Facility","Nav Point"].map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Status</span>
                <select name="status" defaultValue={open?.initial?.status ?? "Active"} className="cc-input mt-1">
                  <option>Active</option><option>Inactive</option>
                </select>
              </label>
            </div>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Building</span><input name="build" defaultValue={open?.initial?.build} className="cc-input mt-1" placeholder="e.g. Academic Block" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Floor / Level</span><input name="floor" defaultValue={open?.initial?.floor} className="cc-input mt-1" placeholder="e.g. 2nd Floor" /></label>
            <DialogFooter>
              <button type="button" onClick={() => setOpen(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">{open?.mode === "edit" ? "Save Changes" : "Add Location"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Sel({ l }: { l: string }) { return <select className="h-11 px-3 rounded-xl border border-border bg-background text-sm min-w-[150px]"><option>{l}</option></select>; }
