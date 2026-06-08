import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import {
  Mail, Phone, MapPin, Calendar, User, Hash, Camera, Edit, Save, X,
  GraduationCap, BookOpen, CalendarCheck, BarChart3, ChevronRight,
  Shield, CircleUser, Building2, Users, KeyRound, Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/parent/profile")({ component: Page });

const LS_KEY = "cc_parent_profile_v1";
const PHOTO_KEY = "cc_parent_photo_v1";

interface ParentForm {
  name: string;
  parentId: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  occupation: string;
  relationship: string;
  username: string;
}

const defaultForm: ParentForm = {
  name: "Rajesh Sharma",
  parentId: "PAR2023045",
  email: "rajesh@parent.edu",
  phone: "98765 11111",
  altPhone: "98765 67890",
  address: "H-23, Green Park, Delhi - 110016",
  occupation: "Business",
  relationship: "Father (Primary)",
  username: "rajesh.sharma",
};

function Page() {
  const { user } = useAuth();
  const [form, setForm] = useState<ParentForm>(defaultForm);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setForm({ ...defaultForm, ...JSON.parse(raw) });
      const p = localStorage.getItem(PHOTO_KEY);
      if (p) setPhoto(p);
    } catch {}
  }, []);

  const persist = (next: ParentForm) => {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setForm(next);
  };

  const save = () => {
    persist(form);
    setEditing(false);
    toast.success("Profile updated successfully");
  };
  const cancel = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      setForm(raw ? { ...defaultForm, ...JSON.parse(raw) } : defaultForm);
    } catch {
      setForm(defaultForm);
    }
    setEditing(false);
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      try { localStorage.setItem(PHOTO_KEY, url); } catch {}
      setPhoto(url);
      toast.success("Profile photo updated");
    };
    reader.readAsDataURL(f);
  };

  const initials = form.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const displayEmail = user?.email ?? form.email;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Home · My Profile"
        action={
          editing ? (
            <div className="flex gap-2">
              <button onClick={cancel} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={save} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          )
        }
      />

      {/* Identity */}
      <Card className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              {photo ? (
                <img src={photo} alt="Parent" className="w-32 h-32 rounded-full object-cover shadow-elegant ring-2 ring-primary/20" />
              ) : (
                <div className="w-32 h-32 rounded-full gradient-primary text-white text-5xl font-bold flex items-center justify-center shadow-elegant">
                  {initials || "P"}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-muted" aria-label="Change photo">
                <Camera className="w-4 h-4 text-primary" />
              </button>
              <input ref={fileRef} onChange={onPickPhoto} type="file" accept="image/*" className="hidden" />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {editing ? (
                  <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} className="text-2xl font-extrabold bg-muted/40 border border-border rounded-lg px-2 py-1 outline-none focus:border-primary" />
                ) : (
                  <h2 className="text-2xl font-extrabold">{form.name}</h2>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">Verified Parent</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Parent ID: {form.parentId}</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {([
                  { i: Mail, k: "Email", key: "email" as const },
                  { i: Phone, k: "Phone", key: "phone" as const },
                  { i: Phone, k: "Alternate Phone", key: "altPhone" as const },
                  { i: MapPin, k: "Address", key: "address" as const },
                ]).map(f => (
                  <div key={f.k} className="flex items-start gap-3">
                    <f.i className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-[120px_1fr] gap-2">
                      <span className="text-muted-foreground">{f.k}</span>
                      {editing ? (
                        <input value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium" />
                      ) : (
                        <span className="font-medium text-foreground">{form[f.key]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-muted/40 border border-border">
            <h3 className="font-bold mb-4">Personal Information</h3>
            <dl className="space-y-3 text-sm">
              {([
                { i: User, k: "Full Name", key: "name" as const },
                { i: Hash, k: "Parent ID", key: "parentId" as const, ro: true },
                { i: Users, k: "Relationship", key: "relationship" as const },
                { i: Briefcase, k: "Occupation", key: "occupation" as const },
                { i: Calendar, k: "Joined Portal", v: "12 Aug 2023", ro: true as const },
              ]).map((f: any) => (
                <div key={f.k} className="flex items-start gap-3">
                  <f.i className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-muted-foreground">{f.k}</span>
                    {editing && f.key && !f.ro ? (
                      <input value={form[f.key as keyof ParentForm]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium" />
                    ) : (
                      <span className="font-medium">{f.key ? form[f.key as keyof ParentForm] : f.v}</span>
                    )}
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>

      {/* Child info + Account */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Child Information</h3>
            <Link to="/parent" className="text-xs font-semibold text-primary hover:underline">Open Dashboard</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Student Name", "Ananya Sharma"],
              ["Roll Number", "23CSE045"],
              ["Branch", "Computer Science & Engineering"],
              ["Section", "A"],
              ["Year / Semester", "3rd Year / Semester 6"],
              ["Admission Year", "2023"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat to="/parent/attendance" icon={CalendarCheck} label="Attendance" value="82%" tint="text-emerald-600 dark:text-emerald-300" />
            <Stat to="/parent/performance" icon={BarChart3} label="Avg Marks" value="78.35%" tint="text-blue-600 dark:text-blue-300" />
            <Stat to="/parent/performance" icon={GraduationCap} label="CGPA" value="8.24" tint="text-violet-600 dark:text-violet-300" />
            <Stat to="/parent/performance" icon={BookOpen} label="Rank" value="5 / 60" tint="text-amber-600 dark:text-amber-300" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Account Information</h3>
            <button onClick={() => setEditing(true)} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </div>
          <dl className="space-y-2.5 text-sm">
            {([
              { i: CircleUser, k: "Username", v: form.username },
              { i: Mail, k: "Email", v: displayEmail },
              { i: Shield, k: "Status", v: <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">Active</span> },
              { i: Calendar, k: "Member Since", v: "12 Aug 2023" },
              { i: Calendar, k: "Last Login", v: "Today, 09:15 AM" },
            ] as const).map(f => (
              <div key={f.k} className="flex items-start gap-3">
                <f.i className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 grid grid-cols-[110px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground">{f.k}</span>
                  <span className="font-medium">{f.v as any}</span>
                </div>
              </div>
            ))}
          </dl>
          <button onClick={() => setPwOpen(true)} className="mt-4 w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
        </Card>
      </div>

      {/* Quick links */}
      <Card className="p-5">
        <h3 className="font-bold mb-4">Important Links</h3>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {[
            { l: "View Attendance", to: "/parent/attendance" },
            { l: "Academic Performance", to: "/parent/performance" },
            { l: "View Timetable", to: "/parent/timetable" },
            { l: "Fee Management", to: "/parent/fees" },
            { l: "Notifications", to: "/parent/notifications" },
            { l: "Campus Navigation", to: "/parent/navigation" },
          ].map(l => (
            <li key={l.l}>
              <Link to={l.to as any} className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/60 hover:text-primary transition-colors text-left">
                <span className="font-medium">{l.l}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

function Stat({ to, icon: Icon, label, value, tint }: { to: string; icon: any; label: string; value: string; tint: string }) {
  return (
    <Link to={to as any} className="rounded-2xl p-3 bg-muted/40 border border-border text-center hover:bg-muted/70 transition-colors block">
      <Icon className={`w-5 h-5 mx-auto ${tint}`} />
      <div className="text-xs text-muted-foreground mt-2">{label}</div>
      <div className={`text-lg font-extrabold mt-1 ${tint}`}>{value}</div>
    </Link>
  );
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next) { toast.error("Please fill all fields"); return; }
    if (next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    toast.success("Password updated successfully");
    setCurrent(""); setNext(""); setConfirm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Use a strong password with at least 8 characters.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Pw label="Current Password" value={current} onChange={setCurrent} />
          <Pw label="New Password" value={next} onChange={setNext} />
          <Pw label="Confirm New Password" value={confirm} onChange={setConfirm} />
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Update Password</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Pw({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type="password" value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}

/* keep imports referenced for tree-shake silencing */
const _u: any = [Building2];
void _u;
