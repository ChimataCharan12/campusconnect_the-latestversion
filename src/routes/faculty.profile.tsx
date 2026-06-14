import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import {
  Mail, Phone, MapPin, Calendar, User, Hash, Camera, Edit, Save, X, KeyRound,
  GraduationCap, BookOpen, Trophy, ChevronRight, Shield, CircleUser, Building2, Award, Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/faculty/profile")({ component: Page });

const LS_KEY = "cc_faculty_profile_v1";
const PHOTO_KEY = "cc_faculty_photo_v1";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Form {
  name: string; facultyId: string; email: string; phone: string;
  dob: string; gender: string; address: string;
  department: string; designation: string; qualification: string;
  specialization: string; experience: string; joined: string;
  username: string;
}

const defaults: Form = {
  name: "", facultyId: "", email: "",
  phone: "", dob: "", gender: "",
  address: "",
  department: "", designation: "",
  qualification: "", specialization: "",
  experience: "", joined: "", username: "",
};

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form>(defaults);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [slots, setSlots] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${user.token}` };
    Promise.all([
      fetch(`${API_BASE}/api/faculty/profile`, { headers }).then((res) => res.json()),
      fetch(`${API_BASE}/api/timetable`, { headers }).then((res) => res.json()),
      fetch(`${API_BASE}/api/students`, { headers }).then((res) => res.json()),
    ])
      .then(([profileRes, slotsRes, studentsRes]) => {
        if (profileRes.success && profileRes.data?.profile) {
          const p = profileRes.data.profile;
          setProfile(p);
          setForm({
            name: p.userId?.name || user?.name || "",
            facultyId: p.employeeId || "",
            email: p.userId?.email || user?.email || "",
            phone: p.phone || "",
            dob: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
            gender: p.gender || "",
            address: p.address || "",
            department: p.department || "",
            designation: p.designation || "",
            qualification: p.qualification || "",
            specialization: p.specialization || "",
            experience: p.experience !== undefined && p.experience !== null ? String(p.experience) : "",
            joined: p.joiningDate ? new Date(p.joiningDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
            username: p.userId?.username || "",
          });
          setPhoto(p.photoUrl || null);
        }
        if (slotsRes.success && slotsRes.data?.slots) {
          setSlots(slotsRes.data.slots);
        }
        if (studentsRes.success && studentsRes.data?.students) {
          setStudents(studentsRes.data.students);
        }
      })
      .catch((err) => console.error("Error fetching faculty profile data:", err))
      .finally(() => setLoading(false));
  }, [user?.token, user?.name, user?.email]);

  const assignedClasses = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s: any) => {
      set.add(`${s.branch}|${s.section}|${s.year}`);
    });
    return set;
  }, [slots]);

  const totalStudentsCount = useMemo(() => {
    if (assignedClasses.size === 0) return 0;
    return students.filter((s: any) => {
      return assignedClasses.has(`${s.branch}|${s.section}|${s.year}`);
    }).length;
  }, [students, assignedClasses]);

  const save = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/faculty/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          phone: form.phone,
          address: form.address,
          qualification: form.qualification,
          gender: form.gender,
          dateOfBirth: form.dob || null,
          specialization: form.specialization,
          experience: form.experience ? Number(form.experience) : null,
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
        facultyId: profile.employeeId || "",
        email: profile.userId?.email || user?.email || "",
        phone: profile.phone || "",
        dob: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
        gender: profile.gender || "",
        address: profile.address || "",
        department: profile.department || "",
        designation: profile.designation || "",
        qualification: profile.qualification || "",
        specialization: profile.specialization || "",
        experience: profile.experience !== undefined && profile.experience !== null ? String(profile.experience) : "",
        joined: profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        username: profile.userId?.username || "",
      });
    }
    setEditing(false);
    toast("Changes discarded");
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      const url = String(r.result);
      setPhoto(url);
      try {
        const res = await fetch(`${API_BASE}/api/faculty/profile`, {
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
    setPhoto(null);
    try {
      const res = await fetch(`${API_BASE}/api/faculty/profile`, {
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

  const initial = form.name?.[0] ?? "F";
  const displayEmail = form.email;

  const linkMap: Record<string, string> = {
    "View My Timetable": "/faculty/timetable",
    "View Attendance Records": "/faculty/attendance",
    "View Marks Uploaded": "/faculty/marks",
    "Faculty Handbook": "/faculty/portals",
    "Leave Application Portal": "/faculty/leave",
    "Payroll Portal": "/faculty/portals",
  };

  const personalFields = [
    { i: Hash, k: "Faculty ID", key: "facultyId" as const, ro: true, v: form.facultyId },
    { i: Mail, k: "Email", key: "email" as const, ro: true, v: form.email },
    { i: Phone, k: "Phone", key: "phone" as const, v: form.phone },
    { i: Calendar, k: "Date of Birth", key: "dob" as const, v: form.dob ? new Date(form.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A", type: "date" },
    { i: User, k: "Gender", key: "gender" as const, v: form.gender === "M" ? "Male" : form.gender === "F" ? "Female" : form.gender || "N/A", type: "select" },
    { i: MapPin, k: "Address", key: "address" as const, v: form.address },
  ];

  const profFields = [
    { i: Building2, k: "Department", key: "department" as const, ro: true, v: form.department },
    { i: Briefcase, k: "Designation", key: "designation" as const, ro: true, v: form.designation },
    { i: GraduationCap, k: "Qualification", key: "qualification" as const, v: form.qualification },
    { i: BookOpen, k: "Specialization", key: "specialization" as const, v: form.specialization || "N/A" },
    { i: Award, k: "Experience", key: "experience" as const, v: form.experience ? `${form.experience} Years` : "N/A", type: "number" },
    { i: Calendar, k: "Joined", key: "joined" as const, ro: true, v: form.joined || "N/A" },
  ];

  const actionBtn = "py-2 text-center rounded-xl text-sm font-semibold border border-primary/30 text-primary hover:bg-primary hover:text-white hover:shadow-glow-violet active:scale-[0.98] transition-all";

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

      <Card className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              {photo ? (
                <img src={photo} alt="Faculty" className="w-32 h-32 rounded-full object-cover shadow-elegant ring-2 ring-primary/20" />
              ) : (
                <div className="w-32 h-32 rounded-full gradient-primary text-white text-5xl font-bold flex items-center justify-center shadow-elegant">{initial}</div>
              )}
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-muted" aria-label="Change photo">
                <Camera className="w-4 h-4 text-primary" />
              </button>
              {photo && (
                <button onClick={onRemovePhoto} className="absolute bottom-1 left-1 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors" aria-label="Remove photo">
                  <X className="w-4 h-4" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold">{form.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">Active Faculty</span>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                {personalFields.map(f => (
                  <div key={f.k} className="flex items-start gap-3">
                    <f.i className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-[120px_1fr] gap-2">
                      <span className="text-muted-foreground">{f.k}</span>
                      {editing && !f.ro ? (
                        f.type === "date" ? (
                          <input type="date" value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
                        ) : f.type === "select" ? (
                          <select value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full">
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        ) : (
                          <input value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
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
            <h3 className="font-bold mb-4">Professional Overview</h3>
            <dl className="space-y-3 text-sm">
              {profFields.map(f => (
                <div key={f.k} className="flex items-start gap-3">
                  <f.i className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-muted-foreground">{f.k}</span>
                    {editing && !f.ro ? (
                      f.type === "number" ? (
                        <input type="number" min="0" value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
                      ) : (
                        <input value={form[f.key]} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} className="bg-muted/40 border border-border rounded-md px-2 py-1 outline-none focus:border-primary font-medium w-full" />
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
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="font-bold mb-4">Teaching Summary</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { i: BookOpen, label: "Subjects", value: profile?.subjects?.length?.toString() || "0", tint: "text-violet-600 dark:text-violet-300" },
              { i: GraduationCap, label: "Sections", value: assignedClasses.size.toString(), tint: "text-emerald-600 dark:text-emerald-300" },
              { i: Trophy, label: "Total Students", value: totalStudentsCount.toString(), tint: "text-blue-600 dark:text-blue-300" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 bg-muted/40 border border-border text-center">
                <s.i className={`w-5 h-5 mx-auto ${s.tint}`} />
                <div className="text-xs text-muted-foreground mt-2">{s.label}</div>
                <div className={`text-xl font-extrabold mt-1 ${s.tint}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/faculty/timetable" className={actionBtn}>View Timetable</Link>
            <Link to="/faculty/students" className={actionBtn}>View Students</Link>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold mb-4">Subjects Taught</h3>
          <ul className="space-y-2.5 text-sm">
            {profile?.subjects && profile.subjects.length > 0 ? (
              profile.subjects.map((sub: string, index: number) => (
                <li key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{sub.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{sub}</div>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">No subjects assigned.</div>
            )}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Account Information</h3>
          </div>
          <dl className="space-y-2.5 text-sm">
            {([
              { i: CircleUser, k: "Username", v: form.username },
              { i: Mail, k: "Email", v: displayEmail },
              { i: Shield, k: "Account Status", v: <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">Active</span> },
              { i: Calendar, k: "Member Since", v: form.joined },
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

      <Card className="p-5">
        <h3 className="font-bold mb-4">Important Links</h3>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {["View My Timetable", "View Attendance Records", "View Marks Uploaded", "Faculty Handbook", "Leave Application Portal", "Payroll Portal"].map(l => (
            <li key={l}>
              <button onClick={() => navigate({ to: linkMap[l] as any })} className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/60 hover:text-primary transition-colors text-left">
                <span className="font-medium">{l}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
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
          {[["Current Password", current, setCurrent] as const, ["New Password", next, setNext] as const, ["Confirm New Password", confirm, setConfirm] as const].map(([l, v, on]) => (
            <label key={l} className="block">
              <span className="text-xs font-medium text-muted-foreground">{l}</span>
              <input type="password" value={v} onChange={e => on(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </label>
          ))}
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet">Update Password</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
