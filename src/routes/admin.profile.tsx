import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MetricCard, SectionCard, StatusPill, GhostButton, PrimaryButton } from "@/components/admin-ui";
import { Users, GraduationCap, Users2, BarChart3, Mail, Phone, MapPin, Calendar, Camera, Pencil, Lock, Bell, ShieldCheck, ChevronRight, Building2, BookOpen, FileText, Send, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({ component: Page });

type Profile = {
  name: string; email: string; phone: string;
  designation: string; department: string; location: string; joinDate: string;
};

const defaultProfile: Profile = {
  name: "Admin", email: "admin@campusconnect.edu", phone: "+91 98765 43210",
  designation: "System Administrator", department: "Administration",
  location: "Hyderabad, Telangana, India", joinDate: "15 Jan 2024",
};

function loadProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile;
  try { const raw = localStorage.getItem("cc_admin_profile"); return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile; } catch { return defaultProfile; }
}

const activity = [
  { t: "Profile updated",   d: "Today, 10:30 AM", s: "Success" },
  { t: "Password changed",  d: "28 Apr 2024, 03:15 PM", s: "Success" },
  { t: "Logged in",         d: "28 Apr 2024, 09:10 AM", s: "Success" },
  { t: "Profile updated",   d: "25 Apr 2024, 11:20 AM", s: "Success" },
  { t: "Logged in",         d: "25 Apr 2024, 09:05 AM", s: "Success" },
];
const access = [
  { i: Building2, l: "Departments", v: 12, t: "violet"  },
  { i: BookOpen,  l: "Courses",     v: 28, t: "blue"    },
  { i: FileText,  l: "Subjects",    v: 85, t: "amber"   },
  { i: Send,      l: "Notices Sent", v: 42, t: "sky"    },
  { i: CheckCircle2, l: "System Uptime", v: "98%", t: "emerald" },
];

function Page() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [editOpen, setEditOpen] = useState(false);
  const [pwd, setPwd] = useState({ cur: "", n: "", c: "" });

  const personal: Array<[string, string]> = [
    ["Full Name", profile.name], ["Email Address", profile.email], ["Phone Number", profile.phone],
    ["Designation", profile.designation], ["Department", profile.department], ["Location", profile.location], ["Join Date", profile.joinDate],
  ];

  const initials = profile.name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Profile = {
      name: String(fd.get("name") || profile.name),
      email: String(fd.get("email") || profile.email),
      phone: String(fd.get("phone") || profile.phone),
      designation: String(fd.get("designation") || profile.designation),
      department: String(fd.get("department") || profile.department),
      location: String(fd.get("location") || profile.location),
      joinDate: profile.joinDate,
    };
    setProfile(next);
    try { localStorage.setItem("cc_admin_profile", JSON.stringify(next)); } catch {}
    toast.success("Profile updated");
    setEditOpen(false);
  };

  const onUpdatePassword = () => {
    if (!pwd.cur || !pwd.n || !pwd.c) return toast.error("Fill all password fields");
    if (pwd.n.length < 8) return toast.error("Password must be at least 8 characters");
    if (pwd.n !== pwd.c) return toast.error("New passwords do not match");
    toast.success("Password updated");
    setPwd({ cur: "", n: "", c: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" subtitle="Dashboard › Profile" action={<GhostButton icon={Pencil} onClick={() => setEditOpen(true)}>Edit Profile</GhostButton>} />

      {/* Hero card */}
      <div className="bg-card rounded-2xl border border-border/70 shadow-soft p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-violet-200 to-violet-100 dark:from-violet-500/30 dark:to-violet-500/10 flex items-center justify-center ring-4 ring-primary/10 mx-auto lg:mx-0">
          <div className="text-3xl font-extrabold text-primary">{initials || "AD"}</div>
          <button onClick={() => toast("Profile photo", { description: "Upload coming soon" })} className="absolute bottom-0 right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md"><Camera className="w-4 h-4" /></button>
        </div>
        <div className="text-center lg:text-left">
          <div className="text-2xl font-extrabold">{profile.name}</div>
          <div className="text-primary font-semibold mt-0.5">{profile.designation}</div>
          <div className="mt-3 space-y-1.5 text-[13px] text-foreground/80">
            <div className="flex items-center gap-2 justify-center lg:justify-start"><Mail className="w-4 h-4 text-muted-foreground" />{profile.email}</div>
            <div className="flex items-center gap-2 justify-center lg:justify-start"><Phone className="w-4 h-4 text-muted-foreground" />{profile.phone}</div>
            <div className="flex items-center gap-2 justify-center lg:justify-start"><MapPin className="w-4 h-4 text-muted-foreground" />{profile.location}</div>
            <div className="flex items-center gap-2 justify-center lg:justify-start"><Calendar className="w-4 h-4 text-muted-foreground" />Joined on {profile.joinDate}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:min-w-[480px]">
          <MiniMetric icon={Users}          label="Total Students" value="2,486" tint="violet"  trend="5.2%" />
          <MiniMetric icon={GraduationCap}  label="Total Faculty"  value="156"   tint="emerald" trend="3.1%" />
          <MiniMetric icon={Users2}         label="Total Parents"  value="1,872" tint="amber"   trend="4.8%" />
          <MiniMetric icon={BarChart3}      label="Attendance"     value="87.6%" tint="blue"    trend="6.3%" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Personal Information" action={<button onClick={() => setEditOpen(true)} className="text-primary"><Pencil className="w-4 h-4" /></button>}>
          <dl className="divide-y divide-border/60">
            {personal.map(([k,v]) => (
              <div key={k} className="py-2.5 grid grid-cols-[120px_1fr] gap-3 text-[13px]"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-3"><GhostButton icon={Pencil} onClick={() => setEditOpen(true)}>Edit Information</GhostButton></div>
        </SectionCard>

        <SectionCard title="Change Password">
          <div className="space-y-3">
            <div>
              <label className="text-[12.5px] font-semibold">Current Password</label>
              <input value={pwd.cur} onChange={e => setPwd({ ...pwd, cur: e.target.value })} type="password" placeholder="Enter current password" className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold">New Password</label>
              <input value={pwd.n} onChange={e => setPwd({ ...pwd, n: e.target.value })} type="password" placeholder="Enter new password" className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold">Confirm New Password</label>
              <input value={pwd.c} onChange={e => setPwd({ ...pwd, c: e.target.value })} type="password" placeholder="Confirm new password" className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="rounded-xl p-3 bg-primary/5 border border-primary/15">
              <div className="text-[12px] font-bold mb-1.5">Password must contain:</div>
              <ul className="text-[11.5px] space-y-1 text-foreground/80">
                {["Minimum 8 characters","Include uppercase & lowercase letters","Include numbers and special characters"].map(r => (
                  <li key={r} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{r}</li>
                ))}
              </ul>
            </div>
            <PrimaryButton icon={Lock} onClick={onUpdatePassword}>Update Password</PrimaryButton>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Quick Actions">
            <ul className="space-y-2">
              {[{i:Pencil,l:"Edit Profile Information",s:"Update your personal details",t:"violet",fn:()=>setEditOpen(true)},{i:Lock,l:"Change Password",s:"Update your account password",t:"emerald",fn:()=>document.querySelector<HTMLInputElement>('input[type="password"]')?.focus()},{i:Bell,l:"Notification Preferences",s:"Manage your notification settings",t:"amber",fn:()=>toast("Notification preferences opened")},{i:ShieldCheck,l:"Security Settings",s:"Manage account security options",t:"blue",fn:()=>toast("Security settings opened")}].map((a,i)=>(
                <li key={i} onClick={a.fn} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 cursor-pointer transition-colors">
                  <div className={`w-9 h-9 rounded-xl bg-${a.t}-100 text-${a.t}-600 dark:bg-${a.t}-500/20 dark:text-${a.t}-300 flex items-center justify-center shrink-0`}><a.i className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0"><div className="text-[12.5px] font-bold leading-tight">{a.l}</div><div className="text-[10.5px] text-muted-foreground">{a.s}</div></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Account Activity" action={<a className="text-[12px] font-semibold text-primary">View All</a>}>
            <ul className="space-y-2.5">
              {activity.map((a,i)=>(
                <li key={i} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0"><div className="text-[12.5px] font-semibold">{a.t}</div><div className="text-[10.5px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.d}</div></div>
                  <StatusPill tone="success">{a.s}</StatusPill>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="System Overview (Your Access)" subtitle="Last updated: 01 May 2024, 10:30 AM">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {access.map((a,i)=>(
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className={`w-10 h-10 rounded-xl bg-${a.t}-100 text-${a.t}-600 dark:bg-${a.t}-500/20 dark:text-${a.t}-300 flex items-center justify-center`}><a.i className="w-5 h-5" /></div>
              <div><div className="text-[18px] font-extrabold leading-tight">{a.v}</div><div className="text-[11px] text-muted-foreground">{a.l}</div></div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="grid grid-cols-2 gap-3">
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Full Name</span><input name="name" required defaultValue={profile.name} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Email</span><input name="email" type="email" required defaultValue={profile.email} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Phone</span><input name="phone" defaultValue={profile.phone} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Designation</span><input name="designation" defaultValue={profile.designation} className="cc-input mt-1" /></label>
            <label className="block"><span className="text-xs font-medium text-muted-foreground">Department</span><input name="department" defaultValue={profile.department} className="cc-input mt-1" /></label>
            <label className="block col-span-2"><span className="text-xs font-medium text-muted-foreground">Location</span><input name="location" defaultValue={profile.location} className="cc-input mt-1" /></label>
            <DialogFooter className="col-span-2">
              <button type="button" onClick={() => setEditOpen(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Cancel</button>
              <button type="submit" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold">Save Changes</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value, tint, trend }: any) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
      <div className={`w-9 h-9 rounded-xl bg-${tint}-100 text-${tint}-600 dark:bg-${tint}-500/20 dark:text-${tint}-300 flex items-center justify-center mb-2`}><Icon className="w-4 h-4" /></div>
      <div className="text-[18px] font-extrabold leading-tight">{value}</div>
      <div className="text-[10.5px] text-muted-foreground">{label}</div>
      <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ {trend} from last month</div>
    </div>
  );
}
