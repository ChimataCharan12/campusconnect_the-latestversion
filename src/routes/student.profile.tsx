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
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
  });
  const navigate = useNavigate();
  const [attSummary, setAttSummary] = useState<any>(null);

  useEffect(() => {
    if (!user?.token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/students/profile`, {
      headers: {
        "Authorization": `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          setProfile(p);
          setForm({
            name: p.userId?.name || user?.name || "",
            email: p.userId?.email || user?.email || "",
            phone: p.phone || "",
            address: p.address || "",
            gender: p.gender || "",
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
          });
          setPhotoUrl(p.photoUrl || null);

          try {
            const summaryRes = await fetch(`${API_BASE}/api/attendance/summary/${p._id}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            const summaryData = await summaryRes.json();
            if (summaryData.success) {
              setAttSummary(summaryData.data);
            }
          } catch (err) {
            console.error("Error fetching student attendance summary:", err);
          }
        }
      })
      .catch((err) => console.error("Error fetching student profile:", err))
      .finally(() => setLoading(false));
  }, [user?.token, user?.name, user?.email]);

  const initial = form.name?.[0] ?? "S";

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      const url = String(r.result);
      setPhotoUrl(url);
      try {
        const res = await fetch(`${API_BASE}/api/students/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ photoUrl: url }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Profile photo updated");
        } else {
          toast.error("Failed to save photo");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error saving photo");
      }
    };
    r.readAsDataURL(f);
  };

  const onRemovePhoto = async () => {
    setPhotoUrl(null);
    try {
      const res = await fetch(`${API_BASE}/api/students/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ photoUrl: "" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile photo removed");
      } else {
        toast.error("Failed to remove photo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing photo");
    }
  };

  const save = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.profile);
        setEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating profile");
    }
  };

  const cancel = () => {
    if (profile) {
      setForm({
        name: profile.userId?.name || user?.name || "",
        email: profile.userId?.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
      });
    }
    setEditing(false);
    toast("Changes discarded");
  };

  const startEdit = () => {
    setEditing(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              {photoUrl && (
                <button onClick={onRemovePhoto} className="absolute bottom-1 left-1 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors" aria-label="Remove photo">
                  <X className="w-4 h-4" />
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold">{form.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">Active Student</span>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  { i: Hash, k: "Roll No.", v: profile?.rollNumber || "N/A", key: null, type: "text" },
                  { i: Mail, k: "Email", v: form.email, key: null, type: "text" },
                  { i: Phone, k: "Phone", v: form.phone, key: "phone" as const, type: "text" },
                  { i: Calendar, k: "Date of Birth", v: form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A", key: "dateOfBirth" as const, type: "date" },
                  { i: User, k: "Gender", v: form.gender === "M" ? "Male" : form.gender === "F" ? "Female" : form.gender || "N/A", key: "gender" as const, type: "select" },
                  { i: MapPin, k: "Address", v: form.address, key: "address" as const, type: "text" },
                ].map(f => (
                  <div key={f.k} className="flex items-start gap-3">
                    <f.i className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-[110px_1fr] gap-2">
                      <span className="text-muted-foreground">{f.k}</span>
                      {editing && f.key ? (
                        f.type === "date" ? (
                          <input type="date" value={(form as any)[f.key]} onChange={e => setForm(s => ({ ...s, [f.key as string]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
                        ) : f.type === "select" ? (
                          <select value={(form as any)[f.key]} onChange={e => setForm(s => ({ ...s, [f.key as string]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full">
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        ) : (
                          <input value={(form as any)[f.key]} onChange={e => setForm(s => ({ ...s, [f.key as string]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
                        )
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
                { i: Building2, k: "Branch", v: profile?.branch || "N/A" },
                { i: BookOpen, k: "Year / Semester", v: `${profile?.year ? profile.year + (profile.year === 1 ? "st" : profile.year === 2 ? "nd" : profile.year === 3 ? "rd" : "th") + " Year" : "N/A"} / Semester ${profile?.semester || "N/A"}` },
                { i: User, k: "Section", v: profile?.section || "N/A" },
                { i: Calendar, k: "Academic Session", v: "2025 - 2026" },
                { i: Hash, k: "Enrollment No.", v: profile?.rollNumber || "N/A" },
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
              { 
                i: CalendarCheck, 
                label: "Overall Attendance", 
                value: attSummary && attSummary.totalClasses > 0 ? `${Math.round(attSummary.overallPercentage)}%` : "0%", 
                sub: attSummary && attSummary.totalClasses > 0 ? (attSummary.overallPercentage >= 75 ? "Good" : "At Risk") : "No logs", 
                tint: attSummary && attSummary.totalClasses > 0 
                  ? (attSummary.overallPercentage >= 75 ? "from-emerald-500 to-emerald-400 text-emerald-600" : "from-rose-500 to-rose-400 text-rose-600")
                  : "from-gray-500 to-gray-400 text-muted-foreground"
              },
              { i: BarChart3, label: "Current CGPA", value: profile?.cgpa?.toFixed(2) || "0.00", sub: "GPA", tint: "from-blue-500 to-blue-400 text-blue-600" },
              { i: Trophy, label: "Current Rank", value: "N/A", sub: "Rank", tint: "from-violet-500 to-violet-400 text-primary" },
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
              { k: "Father / Guardian Name", v: profile?.parentId?.userId?.name || "N/A" },
              { k: "Contact Number", v: profile?.parentId?.phone || "N/A" },
              { k: "Relationship", v: profile?.parentId?.relation || "Guardian" },
              { k: "Email", v: profile?.parentId?.userId?.email || "N/A" },
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
              { i: CircleUser, k: "Username", v: profile?.userId?.username || "N/A" },
              { i: Mail, k: "Email", v: user?.email ?? "N/A" },
              { i: Shield, k: "Account Status", v: <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">Active</span> },
              { i: Calendar, k: "Member Since", v: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A" },
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
              ["Department", profile?.branch || "N/A"],
              ["Program", "B.Tech"],
              ["Year", profile?.year ? `${profile.year} Year` : "N/A"],
              ["Semester", profile?.semester ? `Semester ${profile.semester}` : "N/A"],
              ["Section", profile?.section || "N/A"],
              ["Admission Number", profile?.rollNumber || "N/A"],
              ["Admission Year", profile?.admissionYear || "N/A"],
              ["Academic Session", "2025 - 2026"],
              ["Status", "Active"],
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
