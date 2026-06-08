import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { SectionCard, StatusPill, PrimaryButton, GhostButton } from "@/components/admin-ui";
import {
  Settings as SettingsIcon, Users, GraduationCap, Bell, ClipboardCheck, FileText, Calendar,
  Sliders, ShieldCheck, Database, Plug, Building2, Sun, Moon, Monitor, Check, Upload,
  Plus, Download, Eye, Server, KeyRound, Smartphone, Mail, MessageSquare, Globe, MapPin,
  CreditCard, Bot, Cloud, RotateCcw,
} from "lucide-react";
import { useTheme, useSidebarStyle } from "@/lib/prefs";

export const Route = createFileRoute("/admin/settings")({ component: Page });

type TabKey =
  | "general" | "users" | "academic" | "notifications" | "attendance" | "marks"
  | "timetable" | "system" | "security" | "backup" | "integrations";

const tabs: { key: TabKey; i: any; l: string }[] = [
  { key: "general",       i: SettingsIcon,   l: "General Settings" },
  { key: "users",         i: Users,          l: "User Management" },
  { key: "academic",      i: GraduationCap,  l: "Academic Settings" },
  { key: "notifications", i: Bell,           l: "Notification Settings" },
  { key: "attendance",    i: ClipboardCheck, l: "Attendance Settings" },
  { key: "marks",         i: FileText,       l: "Marks & Grading" },
  { key: "timetable",     i: Calendar,       l: "Timetable Settings" },
  { key: "system",        i: Sliders,        l: "System Preferences" },
  { key: "security",      i: ShieldCheck,    l: "Security Settings" },
  { key: "backup",        i: Database,       l: "Backup & Data" },
  { key: "integrations",  i: Plug,           l: "Integrations" },
];

const PRIMARY_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function Page() {
  const [tab, setTab] = useState<TabKey>("general");
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Dashboard › Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        <SectionCard padding="p-3" className="h-fit lg:sticky lg:top-4">
          <ul className="space-y-1">
            {tabs.map((t) => (
              <li key={t.key}>
                <button
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 h-10 rounded-xl text-[12.5px] font-semibold transition-colors ${
                    tab === t.key
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted/60"
                  }`}
                >
                  <t.i className="w-4 h-4" />
                  <span className="flex-1 text-left">{t.l}</span>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-5 min-w-0">
          {tab === "general" && <GeneralTab />}
          {tab === "users" && <UsersTab />}
          {tab === "academic" && <AcademicTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "attendance" && <AttendanceTab />}
          {tab === "marks" && <MarksTab />}
          {tab === "timetable" && <TimetableTab />}
          {tab === "system" && <SystemTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "backup" && <BackupTab />}
          {tab === "integrations" && <IntegrationsTab />}
        </div>
      </div>
    </div>
  );
}

/* ============================== Shared bits ============================== */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-semibold">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={inputCls}>{children}</select>;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-muted"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function ToggleRow({
  title, subtitle, value, onChange,
}: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold">{title}</div>
        {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

function SaveBar({ onSave, onReset }: { onSave: () => void; onReset?: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {onReset && <GhostButton icon={RotateCcw} onClick={onReset}>Reset</GhostButton>}
      <PrimaryButton onClick={onSave}>Save Changes</PrimaryButton>
    </div>
  );
}

const notify = (label: string) => toast.success(`${label} saved`);

/* ============================== 1. General ============================== */

function GeneralTab() {
  const [form, setForm] = useState({
    name: "MVSR Engineering College", code: "MVSR-001", email: "admin@mvsrec.edu.in",
    phone: "+91 98765 43210", website: "https://mvsrec.edu.in", address: "Nadergul, Hyderabad, Telangana - 501510, India",
    principal: "Dr. G. Kanaka Durga", year: "1981",
  });
  const set = (k: keyof typeof form) => (e: any) => setForm({ ...form, [k]: e.target.value });
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  return (
    <SectionCard title="General Information" subtitle="Manage basic information about the campus.">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 flex items-center justify-center">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <div className="text-[12.5px] font-bold">College Identity</div>
          <div className="text-[11px] text-muted-foreground">Branding shown across the platform.</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="College / Campus Name"><Input value={form.name} onChange={set("name")} /></Field>
        <Field label="College Code"><Input value={form.code} onChange={set("code")} /></Field>
        <Field label="College Email"><Input value={form.email} onChange={set("email")} /></Field>
        <Field label="Phone Number"><Input value={form.phone} onChange={set("phone")} /></Field>
        <Field label="Website URL"><Input value={form.website} onChange={set("website")} /></Field>
        <Field label="Principal Name"><Input value={form.principal} onChange={set("principal")} /></Field>
        <Field label="Establishment Year"><Input value={form.year} onChange={set("year")} /></Field>
        <div className="sm:col-span-2">
          <Field label="Address"><Textarea rows={2} value={form.address} onChange={set("address")} /></Field>
        </div>
        <Field label="College Logo">
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && toast.success(`Logo: ${e.target.files[0].name}`)} />
          <GhostButton icon={Upload} onClick={() => logoRef.current?.click()}>Upload Logo</GhostButton>
        </Field>
        <Field label="College Banner">
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && toast.success(`Banner: ${e.target.files[0].name}`)} />
          <GhostButton icon={Upload} onClick={() => bannerRef.current?.click()}>Upload Banner</GhostButton>
        </Field>
      </div>
      <SaveBar onSave={() => notify("General settings")} onReset={() => toast("Reset to last saved values")} />
    </SectionCard>
  );
}

/* ============================== 2. Users ============================== */

function UsersTab() {
  const [perm, setPerm] = useState({
    studentReg: true, facultyReg: true, parentReg: true, autoApprove: false, verify: true,
  });
  const [limits, setLimits] = useState({ status: "active", attempts: 5, lock: 15 });
  const set = (k: keyof typeof perm) => (v: boolean) => setPerm({ ...perm, [k]: v });
  return (
    <>
      <SectionCard title="Registration & Approval" subtitle="Control how users sign up and get approved.">
        <ToggleRow title="Allow Student Registration" subtitle="Students can self-register through the public form" value={perm.studentReg} onChange={set("studentReg")} />
        <ToggleRow title="Allow Faculty Registration" subtitle="Faculty can request accounts pending approval" value={perm.facultyReg} onChange={set("facultyReg")} />
        <ToggleRow title="Allow Parent Registration" subtitle="Parents may register with a valid student linkage" value={perm.parentReg} onChange={set("parentReg")} />
        <ToggleRow title="Auto-Approve Accounts" subtitle="Skip manual review for new sign-ups" value={perm.autoApprove} onChange={set("autoApprove")} />
        <ToggleRow title="Account Verification Required" subtitle="Email verification before first login" value={perm.verify} onChange={set("verify")} />
      </SectionCard>
      <SectionCard title="Account Limits">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Default User Status">
            <Select value={limits.status} onChange={(e) => setLimits({ ...limits, status: e.target.value })}>
              <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
            </Select>
          </Field>
          <Field label="Max Login Attempts">
            <Input type="number" value={limits.attempts} onChange={(e) => setLimits({ ...limits, attempts: +e.target.value })} />
          </Field>
          <Field label="Account Lock Duration (min)">
            <Input type="number" value={limits.lock} onChange={(e) => setLimits({ ...limits, lock: +e.target.value })} />
          </Field>
        </div>
        <SaveBar onSave={() => notify("User management")} />
      </SectionCard>
      <SectionCard title="Role Permissions" subtitle="High-level permissions per role (frontend mock).">
        <div className="grid sm:grid-cols-2 gap-3">
          {["Student", "Faculty", "Parent", "Admin"].map((r) => (
            <div key={r} className="p-3 rounded-xl border border-border/60">
              <div className="text-[12.5px] font-bold">{r} Permissions</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Configure module access for {r.toLowerCase()}s.</div>
              <GhostButton icon={KeyRound} onClick={() => { try { localStorage.setItem(`cc_perm_${r.toLowerCase()}`, JSON.stringify({ enabledAt: Date.now() })); } catch {} toast.success(`${r} permissions opened — defaults applied`); }}>Configure</GhostButton>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

/* ============================== 3. Academic ============================== */

function AcademicTab() {
  const [a, setA] = useState({ year: "2025-26", system: "semester", count: 8, scale: "10" });
  const [opt, setOpt] = useState({ promo: true, backlog: true, history: true });
  return (
    <>
      <SectionCard title="Academic Structure">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Academic Year"><Input value={a.year} onChange={(e) => setA({ ...a, year: e.target.value })} /></Field>
          <Field label="Semester System">
            <Select value={a.system} onChange={(e) => setA({ ...a, system: e.target.value })}>
              <option value="semester">Semester</option><option value="trimester">Trimester</option><option value="annual">Annual</option>
            </Select>
          </Field>
          <Field label="Number of Semesters"><Input type="number" value={a.count} onChange={(e) => setA({ ...a, count: +e.target.value })} /></Field>
          <Field label="CGPA Scale">
            <Select value={a.scale} onChange={(e) => setA({ ...a, scale: e.target.value })}>
              <option value="10">10-point</option><option value="4">4-point</option>
            </Select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 mt-4">
          {["Departments", "Sections", "Subject Categories"].map((x) => (
            <GhostButton key={x} icon={Plus} onClick={() => { const name = window.prompt(`New ${x.replace(/s$/, "")} name`); if (!name) return; try { const k = `cc_${x.toLowerCase().replace(/\s+/g, "_")}`; const cur = JSON.parse(localStorage.getItem(k) || "[]"); cur.push(name); localStorage.setItem(k, JSON.stringify(cur)); } catch {} toast.success(`${name} added to ${x}`); }}>{x}</GhostButton>
          ))}
        </div>
        <SaveBar onSave={() => notify("Academic settings")} />
      </SectionCard>
      <SectionCard title="Options">
        <ToggleRow title="Enable Semester Promotion" value={opt.promo} onChange={(v) => setOpt({ ...opt, promo: v })} />
        <ToggleRow title="Enable Backlog Tracking" value={opt.backlog} onChange={(v) => setOpt({ ...opt, backlog: v })} />
        <ToggleRow title="Enable Academic History" value={opt.history} onChange={(v) => setOpt({ ...opt, history: v })} />
      </SectionCard>
    </>
  );
}

/* ============================== 4. Notifications ============================== */

function NotificationsTab() {
  const [ch, setCh] = useState({ email: true, sms: false, push: true, inapp: true });
  const [ev, setEv] = useState({ attendance: true, marks: true, assignment: true, timetable: true, fee: true, general: true });
  return (
    <>
      <SectionCard title="Notification Channels">
        <ToggleRow title="Email Notifications" value={ch.email} onChange={(v) => setCh({ ...ch, email: v })} />
        <ToggleRow title="SMS Notifications" value={ch.sms} onChange={(v) => setCh({ ...ch, sms: v })} />
        <ToggleRow title="Push Notifications" value={ch.push} onChange={(v) => setCh({ ...ch, push: v })} />
        <ToggleRow title="In-App Notifications" value={ch.inapp} onChange={(v) => setCh({ ...ch, inapp: v })} />
      </SectionCard>
      <SectionCard title="Events">
        <ToggleRow title="Attendance Alerts" value={ev.attendance} onChange={(v) => setEv({ ...ev, attendance: v })} />
        <ToggleRow title="Marks Published Alerts" value={ev.marks} onChange={(v) => setEv({ ...ev, marks: v })} />
        <ToggleRow title="Assignment Alerts" value={ev.assignment} onChange={(v) => setEv({ ...ev, assignment: v })} />
        <ToggleRow title="Timetable Changes" value={ev.timetable} onChange={(v) => setEv({ ...ev, timetable: v })} />
        <ToggleRow title="Fee Due Reminders" value={ev.fee} onChange={(v) => setEv({ ...ev, fee: v })} />
        <ToggleRow title="General Announcements" value={ev.general} onChange={(v) => setEv({ ...ev, general: v })} />
        <SaveBar onSave={() => notify("Notification settings")} />
      </SectionCard>
    </>
  );
}

/* ============================== 5. Attendance ============================== */

function AttendanceTab() {
  const [a, setA] = useState({ min: 75, warn: 80, lock: 7, lateMax: 3, editHours: 24 });
  const [o, setO] = useState({ lateAllowed: true, reports: true, notifyStudent: true, notifyParent: true });
  return (
    <>
      <SectionCard title="Attendance Rules">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Minimum Attendance %"><Input type="number" value={a.min} onChange={(e) => setA({ ...a, min: +e.target.value })} /></Field>
          <Field label="Warning Threshold %"><Input type="number" value={a.warn} onChange={(e) => setA({ ...a, warn: +e.target.value })} /></Field>
          <Field label="Attendance Lock Period (days)"><Input type="number" value={a.lock} onChange={(e) => setA({ ...a, lock: +e.target.value })} /></Field>
          <Field label="Max Late Entries / month"><Input type="number" value={a.lateMax} onChange={(e) => setA({ ...a, lateMax: +e.target.value })} /></Field>
          <Field label="Editing Time Limit (hours)"><Input type="number" value={a.editHours} onChange={(e) => setA({ ...a, editHours: +e.target.value })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Automation">
        <ToggleRow title="Late Entry Allowed" value={o.lateAllowed} onChange={(v) => setO({ ...o, lateAllowed: v })} />
        <ToggleRow title="Auto-Generate Attendance Reports" value={o.reports} onChange={(v) => setO({ ...o, reports: v })} />
        <ToggleRow title="Auto-Notify Students" value={o.notifyStudent} onChange={(v) => setO({ ...o, notifyStudent: v })} />
        <ToggleRow title="Auto-Notify Parents" value={o.notifyParent} onChange={(v) => setO({ ...o, notifyParent: v })} />
        <SaveBar onSave={() => notify("Attendance settings")} />
      </SectionCard>
    </>
  );
}

/* ============================== 6. Marks ============================== */

function MarksTab() {
  const [w, setW] = useState({ internal: 30, external: 70, pass: 40, method: "absolute" });
  const [g, setG] = useState({ O: 90, "A+": 80, A: 70, "B+": 60, B: 50, C: 40, Fail: 0 });
  const [auto, setAuto] = useState({ grade: true, cgpa: true, rank: false });
  return (
    <>
      <SectionCard title="Weightage & Pass Criteria">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Internal Marks Weightage (%)"><Input type="number" value={w.internal} onChange={(e) => setW({ ...w, internal: +e.target.value })} /></Field>
          <Field label="External Marks Weightage (%)"><Input type="number" value={w.external} onChange={(e) => setW({ ...w, external: +e.target.value })} /></Field>
          <Field label="Passing Marks (%)"><Input type="number" value={w.pass} onChange={(e) => setW({ ...w, pass: +e.target.value })} /></Field>
          <Field label="Grade Calculation">
            <Select value={w.method} onChange={(e) => setW({ ...w, method: e.target.value })}>
              <option value="absolute">Absolute</option><option value="relative">Relative (Curve)</option>
            </Select>
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Grade Boundaries (min %)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(g).map(([k, v]) => (
            <Field key={k} label={k}>
              <Input type="number" value={v} onChange={(e) => setG({ ...g, [k]: +e.target.value })} />
            </Field>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Automation">
        <ToggleRow title="Auto Calculate Grades" value={auto.grade} onChange={(v) => setAuto({ ...auto, grade: v })} />
        <ToggleRow title="Auto Calculate CGPA" value={auto.cgpa} onChange={(v) => setAuto({ ...auto, cgpa: v })} />
        <ToggleRow title="Auto Generate Rank Lists" value={auto.rank} onChange={(v) => setAuto({ ...auto, rank: v })} />
        <SaveBar onSave={() => notify("Marks & grading")} />
      </SectionCard>
    </>
  );
}

/* ============================== 7. Timetable ============================== */

function TimetableTab() {
  const [t, setT] = useState({ periods: 7, periodMin: 50, breakMin: 10, lunchMin: 45, start: "09:00", end: "16:30" });
  const [days, setDays] = useState({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false });
  const [opt, setOpt] = useState({ autoGen: false, facultyConflict: true, roomConflict: true });
  return (
    <>
      <SectionCard title="Working Days">
        <div className="flex flex-wrap gap-2">
          {Object.entries(days).map(([d, on]) => (
            <button key={d} onClick={() => setDays({ ...days, [d]: !on })}
              className={`px-3 h-9 rounded-xl text-[12px] font-semibold border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}>
              {d}
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Schedule">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Periods Per Day"><Input type="number" value={t.periods} onChange={(e) => setT({ ...t, periods: +e.target.value })} /></Field>
          <Field label="Period Duration (min)"><Input type="number" value={t.periodMin} onChange={(e) => setT({ ...t, periodMin: +e.target.value })} /></Field>
          <Field label="Break Duration (min)"><Input type="number" value={t.breakMin} onChange={(e) => setT({ ...t, breakMin: +e.target.value })} /></Field>
          <Field label="Lunch Duration (min)"><Input type="number" value={t.lunchMin} onChange={(e) => setT({ ...t, lunchMin: +e.target.value })} /></Field>
          <Field label="College Start Time"><Input type="time" value={t.start} onChange={(e) => setT({ ...t, start: e.target.value })} /></Field>
          <Field label="College End Time"><Input type="time" value={t.end} onChange={(e) => setT({ ...t, end: e.target.value })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Options">
        <ToggleRow title="Auto Generate Timetable" value={opt.autoGen} onChange={(v) => setOpt({ ...opt, autoGen: v })} />
        <ToggleRow title="Faculty Conflict Detection" value={opt.facultyConflict} onChange={(v) => setOpt({ ...opt, facultyConflict: v })} />
        <ToggleRow title="Room Conflict Detection" value={opt.roomConflict} onChange={(v) => setOpt({ ...opt, roomConflict: v })} />
        <SaveBar onSave={() => notify("Timetable settings")} />
      </SectionCard>
    </>
  );
}

/* ============================== 8. System ============================== */

function SystemTab() {
  const [theme, setTheme] = useTheme();
  const [sidebarStyle, setSidebarStyle] = useSidebarStyle();
  const [color, setColor] = useState(0);
  const [pref, setPref] = useState({ landing: "dashboard", layout: "default", density: "comfortable", animation: "balanced" });
  return (
    <>
      <SectionCard title="Theme" subtitle="Choose your preferred theme — applied instantly and saved locally.">
        <div className="grid grid-cols-3 gap-2">
          {[{ v: "light", l: "Light", i: Sun }, { v: "dark", l: "Dark", i: Moon }, { v: "system", l: "System", i: Monitor }].map((t) => (
            <button key={t.v} onClick={() => setTheme(t.v as any)}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-[12.5px] font-semibold transition-colors ${
                theme === t.v ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
              }`}>
              <t.i className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Primary Color" subtitle="Visual accent color preview.">
        <div className="flex flex-wrap gap-2">
          {PRIMARY_COLORS.map((c, i) => (
            <button key={c} onClick={() => setColor(i)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: c }}>
              {color === i && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Sidebar Style" subtitle="Switches sidebar between full and compact mode immediately.">
        <div className="grid grid-cols-2 gap-2">
          {[{ v: "full", l: "Full", s: "Expanded sidebar with labels" }, { v: "compact", l: "Compact", s: "Icon only sidebar" }].map((o) => (
            <button key={o.v} onClick={() => setSidebarStyle(o.v as any)}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${sidebarStyle === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <div className="text-[12.5px] font-bold">{o.l}</div>
              <div className="text-[10.5px] text-muted-foreground">{o.s}</div>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Other Preferences">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Default Landing Page">
            <Select value={pref.landing} onChange={(e) => setPref({ ...pref, landing: e.target.value })}>
              <option value="dashboard">Dashboard</option><option value="students">Students</option><option value="reports">Reports</option>
            </Select>
          </Field>
          <Field label="Dashboard Layout">
            <Select value={pref.layout} onChange={(e) => setPref({ ...pref, layout: e.target.value })}>
              <option value="default">Default</option><option value="compact">Compact</option><option value="wide">Wide</option>
            </Select>
          </Field>
          <Field label="Table Density">
            <Select value={pref.density} onChange={(e) => setPref({ ...pref, density: e.target.value })}>
              <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
            </Select>
          </Field>
          <Field label="Animation Level">
            <Select value={pref.animation} onChange={(e) => setPref({ ...pref, animation: e.target.value })}>
              <option value="balanced">Balanced</option><option value="reduced">Reduced</option><option value="high">High</option>
            </Select>
          </Field>
        </div>
        <SaveBar onSave={() => notify("System preferences")} />
      </SectionCard>
    </>
  );
}

/* ============================== 9. Security ============================== */

function SecurityTab() {
  const [pw, setPw] = useState({ min: 8, expiry: 90, complex: true });
  const [s, setS] = useState({ timeout: 30, attempts: 5 });
  const [o, setO] = useState({ twofa: true, captcha: true, alerts: true, device: false });
  return (
    <>
      <SectionCard title="Password Policy">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Minimum Length"><Input type="number" value={pw.min} onChange={(e) => setPw({ ...pw, min: +e.target.value })} /></Field>
          <Field label="Password Expiry (days)"><Input type="number" value={pw.expiry} onChange={(e) => setPw({ ...pw, expiry: +e.target.value })} /></Field>
          <Field label="Complexity">
            <Select value={pw.complex ? "1" : "0"} onChange={(e) => setPw({ ...pw, complex: e.target.value === "1" })}>
              <option value="1">Require upper, number & symbol</option><option value="0">No requirement</option>
            </Select>
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Session">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Session Timeout (min)"><Input type="number" value={s.timeout} onChange={(e) => setS({ ...s, timeout: +e.target.value })} /></Field>
          <Field label="Max Login Attempts"><Input type="number" value={s.attempts} onChange={(e) => setS({ ...s, attempts: +e.target.value })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Protection">
        <ToggleRow title="Two-Factor Authentication" subtitle="Require 2FA for admin users" value={o.twofa} onChange={(v) => setO({ ...o, twofa: v })} />
        <ToggleRow title="CAPTCHA Protection" subtitle="On login & sensitive forms" value={o.captcha} onChange={(v) => setO({ ...o, captcha: v })} />
        <ToggleRow title="Login Alerts" subtitle="Email user on new device login" value={o.alerts} onChange={(v) => setO({ ...o, alerts: v })} />
        <ToggleRow title="Device Tracking" subtitle="Track and display known devices" value={o.device} onChange={(v) => setO({ ...o, device: v })} />
        <SaveBar onSave={() => notify("Security settings")} />
      </SectionCard>
    </>
  );
}

/* ============================== 10. Backup ============================== */

function BackupTab() {
  const [freq, setFreq] = useState("weekly");
  const [logsOpen, setLogsOpen] = useState(false);
  const logs = [
    { t: new Date().toISOString(), level: "INFO", msg: "Scheduled backup completed" },
    { t: new Date(Date.now() - 3600_000).toISOString(), level: "INFO", msg: "User admin@campus.edu signed in" },
    { t: new Date(Date.now() - 7200_000).toISOString(), level: "WARN", msg: "Slow query (1.2s) on attendance_records" },
    { t: new Date(Date.now() - 86400_000).toISOString(), level: "INFO", msg: "Daily report generated" },
    { t: new Date(Date.now() - 90000_000).toISOString(), level: "ERROR", msg: "Failed login attempt — rate limited" },
  ];
  const download = (label: string) => {
    const blob = new Blob([`Campus Connect — ${label}\nGenerated: ${new Date().toISOString()}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${label.replace(/\s+/g, "_").toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${label} downloaded`);
  };
  return (
    <>
      <SectionCard title="Backup Status">
        <div className="rounded-xl border border-border/60 p-3 mb-3 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="text-[12px] font-bold">Last Backup</div>
            <div className="text-[11px] text-muted-foreground">{new Date().toLocaleString()}</div>
          </div>
          <StatusPill tone="success">Success</StatusPill>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <GhostButton icon={Plus} onClick={() => { try { const k = "cc_backups"; const cur = JSON.parse(localStorage.getItem(k) || "[]"); cur.unshift({ at: new Date().toISOString(), size: `${(Math.random() * 60 + 120).toFixed(1)} MB` }); localStorage.setItem(k, JSON.stringify(cur.slice(0, 20))); } catch {} toast.success("Backup created successfully"); }}>Create Backup</GhostButton>
          <GhostButton icon={Download} onClick={() => download("Latest Backup")}>Download Backup</GhostButton>
          <GhostButton icon={Upload} onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".sql,.zip,.bak,.json"; i.onchange = () => { const f = i.files?.[0]; if (f) toast.success(`Restoring from ${f.name}...`); }; i.click(); }}>Restore Backup</GhostButton>
          <GhostButton icon={Eye} onClick={() => setLogsOpen(true)}>View System Logs</GhostButton>
        </div>
      </SectionCard>
      <SectionCard title="Schedule">
        <Field label="Backup Frequency">
          <Select value={freq} onChange={(e) => setFreq(e.target.value)}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </Select>
        </Field>
        <SaveBar onSave={() => notify("Backup schedule")} />
      </SectionCard>
      <SectionCard title="Export Data">
        <div className="grid sm:grid-cols-2 gap-2">
          {["Student Data", "Faculty Data", "Parent Data", "Attendance Data", "Marks Data"].map((x) => (
            <GhostButton key={x} icon={Server} onClick={() => download(`Export ${x}`)}>Export {x}</GhostButton>
          ))}
        </div>
      </SectionCard>

      {logsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setLogsOpen(false)}>
          <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full p-5 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold">System Logs</h3>
                <p className="text-xs text-muted-foreground">Most recent system events.</p>
              </div>
              <button onClick={() => setLogsOpen(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-muted/30">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase">
                  <tr><th className="text-left px-3 py-2">Time</th><th className="text-left px-3">Level</th><th className="text-left px-3">Message</th></tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{new Date(l.t).toLocaleString()}</td>
                      <td className={`px-3 font-bold ${l.level === "ERROR" ? "text-rose-600" : l.level === "WARN" ? "text-amber-600" : "text-emerald-600"}`}>{l.level}</td>
                      <td className="px-3">{l.msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================== 11. Integrations ============================== */

function IntegrationsTab() {
  const items = [
    { i: MapPin, l: "Google Maps", connected: true },
    { i: Mail, l: "Gmail SMTP", connected: true },
    { i: MessageSquare, l: "SMS Gateway", connected: false },
    { i: Bot, l: "AI Chatbot API", connected: true },
    { i: CreditCard, l: "Payment Gateway", connected: false },
    { i: Cloud, l: "Cloud Storage", connected: true },
  ];
  const [state, setState] = useState(items);
  return (
    <SectionCard title="External Integrations" subtitle="Connect Campus Connect to third-party services.">
      <div className="grid sm:grid-cols-2 gap-3">
        {state.map((s, idx) => (
          <div key={s.l} className="p-4 rounded-xl border border-border/60 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><s.i className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold">{s.l}</div>
              <StatusPill tone={s.connected ? "success" : "muted"}>{s.connected ? "Connected" : "Not Connected"}</StatusPill>
            </div>
            <GhostButton icon={Plug} onClick={() => {
              const next = [...state]; next[idx] = { ...s, connected: !s.connected }; setState(next);
              toast.success(`${s.l} ${s.connected ? "disconnected" : "connected"}`);
            }}>
              {s.connected ? "Configure" : "Connect"}
            </GhostButton>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11.5px] text-muted-foreground">
        <Globe className="w-4 h-4" /> Integrations route through the secure Campus Connect gateway.
        <Smartphone className="w-4 h-4 ml-2" /> Mobile push uses Firebase by default.
      </div>
    </SectionCard>
  );
}
