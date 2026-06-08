import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import {
  Mail, Phone, MapPin, Calendar, User, Hash, Camera, Edit, Save, X,
  GraduationCap, BookOpen, Trophy, CalendarCheck, BarChart3,
  ChevronRight, Shield, CircleUser, Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STUDENT_PHOTO_KEY = "cc_student_photo_v1";

export const Route = createFileRoute("/student/profile")({ component: Page });

const linkMap: Record<string, string> = {
  "View Attendance Records": "/student/attendance",
  "View Marks & Performance": "/student/marks",
  "View Timetable": "/student/timetable",
  "Fee Payment Portal": "/student/portals",
  "Results Portal": "/student/portals",
};

function Page() {
  const { user } = useAuth();
  const initial = user?.name?.[0] ?? "A";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "Ananya Sharma",
    email: user?.email ?? "ananya.sharma@student.edu",
    phone: "98765 43210",
    address: "H-23, Green Park, Delhi - 110016",
  });
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try { const p = localStorage.getItem(STUDENT_PHOTO_KEY); if (p) setPhotoUrl(p); } catch {}
  }, []);
  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      try { localStorage.setItem(STUDENT_PHOTO_KEY, url); } catch {}
      setPhotoUrl(url);
      toast.success("Profile photo updated");
    };
    r.readAsDataURL(f);
  };

  const save = () => { setEditing(false); toast.success("Profile updated"); };
  const cancel = () => { setEditing(false); toast("Changes discarded"); };

  const startEdit = () => {
    setEditing(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

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

      {/* Identity card */}
      <Card className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-elegant ring-2 ring-primary/20" />
              ) : (
                <div className="w-32 h-32 rounded-full gradient-primary text-white text-5xl font-bold flex items-center justify-center shadow-elegant">
                  {initial}
                </div>
              )}
              <button onClick={() => photoRef.current?.click()} className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-muted" aria-label="Change photo">
                <Camera className="w-4 h-4 text-primary" />
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {editing ? (
                  <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} className="text-2xl font-extrabold bg-muted/40 border border-border rounded-lg px-2 py-1 outline-none focus:border-primary" />
                ) : (
                  <h2 className="text-2xl font-extrabold">{form.name}</h2>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">Active Student</span>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  { i: Hash, k: "Roll No.", v: "23CSE045", key: null as null | "name" },
                  { i: Mail, k: "Email", v: form.email, key: "email" as const },
                  { i: Phone, k: "Phone", v: form.phone, key: "phone" as const },
                  { i: Calendar, k: "Date of Birth", v: "15 Aug 2004", key: null },
                  { i: User, k: "Gender", v: "Female", key: null },
                  { i: MapPin, k: "Address", v: form.address, key: "address" as const },
                ].map(f => (
                  <div key={f.k} className="flex items-start gap-3">
                    <f.i className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-[110px_1fr] gap-2">
                      <span className="text-muted-foreground">{f.k}</span>
                      {editing && f.key ? (
                        <input value={(form as any)[f.key]} onChange={e => setForm(s => ({ ...s, [f.key as string]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium" />
                      ) : (
                        <span className="font-medium text-foreground">{f.v}</span>
                      )}
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-muted/40 border border-border">
            <h3 className="font-bold mb-4">Quick Overview</h3>
            <dl className="space-y-3 text-sm">
              {[
                { i: GraduationCap, k: "Program", v: "B.Tech" },
                { i: Building2, k: "Branch", v: "Computer Science & Engineering" },
                { i: BookOpen, k: "Year / Semester", v: "3rd Year / Semester 6" },
                { i: User, k: "Section", v: "A" },
                { i: Calendar, k: "Academic Session", v: "2024 - 2025" },
                { i: Hash, k: "Enrollment No.", v: "CS2023A045" },
              ].map(f => (
                <div key={f.k} className="flex items-start gap-3">
                  <f.i className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-muted-foreground">{f.k}</span>
                    <span className="font-medium">{f.v}</span>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>

      {/* Quick stats / parent / account */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Academic Summary</h3>
            <Link to="/student/marks" className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { i: CalendarCheck, label: "Overall Attendance", value: "82%", sub: "Good", tint: "from-emerald-500 to-emerald-400 text-emerald-600" },
              { i: BarChart3, label: "Current CGPA", value: "8.24", sub: "Good", tint: "from-blue-500 to-blue-400 text-blue-600" },
              { i: Trophy, label: "Current Rank", value: "5/60", sub: "Top 10%", tint: "from-violet-500 to-violet-400 text-primary" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 bg-muted/40 border border-border text-center">
                <s.i className={`w-5 h-5 mx-auto ${s.tint.split(" ").pop()}`} />
                <div className="text-xs text-muted-foreground mt-2">{s.label}</div>
                <div className={`text-xl font-extrabold mt-1 ${s.tint.split(" ").pop()}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/student/attendance"
              className="py-2 text-center rounded-xl text-sm font-semibold border border-primary/30 text-primary hover:bg-primary hover:text-white hover:shadow-glow-violet active:scale-[0.98] transition-all"
            >
              View Attendance
            </Link>
            <Link
              to="/student/marks"
              className="py-2 text-center rounded-xl text-sm font-semibold border border-primary/30 text-primary hover:bg-primary hover:text-white hover:shadow-glow-violet active:scale-[0.98] transition-all"
            >
              View Marks
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold mb-4">Parent / Guardian</h3>
          <dl className="space-y-2.5 text-sm">
            {[
              { k: "Father Name", v: "Rajesh Sharma" },
              { k: "Father Contact", v: "98765 11111" },
              { k: "Mother Name", v: "Neha Sharma" },
              { k: "Mother Contact", v: "98765 22222" },
              { k: "Guardian Email", v: "rajesh.sharma@email.com" },
              { k: "Relationship", v: "Father" },
            ].map(f => (
              <div key={f.k} className="grid grid-cols-[120px_1fr] gap-2">
                <span className="text-muted-foreground">{f.k}</span>
                <span className="font-medium truncate">{f.v}</span>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Account Information</h3>
            <button onClick={startEdit} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button>
          </div>
          <dl className="space-y-2.5 text-sm">
            {[
              { i: CircleUser, k: "Username", v: "ananya.sharma" },
              { i: Mail, k: "Email", v: user?.email ?? "ananya.sharma@student.edu" },
              { i: Shield, k: "Account Status", v: <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">Active</span> },
              { i: Calendar, k: "Member Since", v: "10 Aug 2023" },
              { i: Calendar, k: "Last Login", v: "Today, 09:15 AM" },
            ].map(f => (
              <div key={f.k} className="flex items-start gap-3">
                <f.i className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 grid grid-cols-[110px_1fr] gap-2 items-center">
                  <span className="text-muted-foreground">{f.k}</span>
                  <span className="font-medium">{f.v as any}</span>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold mb-4">Academic Details</h3>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Department", "Computer Science & Engineering"],
              ["Program", "B.Tech"],
              ["Year", "3rd Year"],
              ["Semester", "Semester 6"],
              ["Section", "A"],
              ["Admission Number", "CS2023A045"],
              ["Admission Year", "2023"],
              ["Academic Session", "2024 - 2025"],
              ["Advisor", "Dr. Priya Sharma"],
              ["Mentor", "Prof. Amit Verma"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold mb-4">Important Links</h3>
          <ul className="divide-y divide-border text-sm">
            {[
              "View Attendance Records",
              "View Marks & Performance",
              "View Timetable",
              "Fee Payment Portal",
              "Results Portal",
            ].map(l => (
              <li key={l}>
                <button onClick={() => navigate({ to: linkMap[l] || "/student" })} className="w-full flex items-center justify-between py-3 hover:text-primary transition-colors text-left">
                  <span className="font-medium">{l}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/40 flex items-center gap-3 text-sm">
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">i</div>
        <span>Keep your profile information updated. Contact the admin office for any corrections.</span>
      </div>
    </div>
  );
}
