import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, User, Lock, Eye, EyeOff, LogIn, Users, UserCog, GraduationCap, Shield, Zap, Heart, MessageSquare, X, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { toast } from "sonner";
import campusBg from "@/assets/login-campus.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Campus Connect" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  // Contact Admin modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const openContactModal = () => {
    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setContactError(null);
    setContactSuccess(false);
    setContactOpen(true);
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setContactLoading(true);
    try {
      const res = await fetch("/api/contact-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setContactError(data.message || "Failed to send message. Please try again.");
        return;
      }
      setContactSuccess(true);
      toast.success("Message sent to admin!");
    } catch {
      setContactError("Network error. Please check your connection.");
    } finally {
      setContactLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { toast.error("Please select a login role"); return; }
    if (!username || !password) { toast.error("Please enter username and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials. Please try again.");
        return;
      }

      // Check if role matches selected role
      if (data.data.user.role !== role) {
        toast.error(`Invalid role: registered as ${data.data.user.role}, but logging in as ${role}.`);
        return;
      }

      const authUser = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        subtitle: data.data.user.subtitle,
        token: data.data.token,
      };

      login(authUser);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate({ to: `/${role}` as any });
    } catch (err: any) {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: Role; label: string; icon: any }[] = [
    { id: "student", label: "Student", icon: GraduationCap },
    { id: "faculty", label: "Faculty", icon: Users },
    { id: "parent", label: "Parent", icon: UserCog },
    { id: "admin", label: "Admin", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.015_285)] flex">
      {/* LEFT — locked Campus Connect purple panel with campus illustration */}
      <div
        className="relative hidden lg:flex flex-col w-[46%] xl:w-[44%] text-white p-10 xl:p-14 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.40 0.22 285 / 0.92) 0%, oklch(0.36 0.22 285 / 0.85) 50%, oklch(0.32 0.20 285 / 0.92) 100%), url(${campusBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        {/* Dot pattern accent */}
        <div className="absolute top-32 right-16 w-24 h-24 cc-dots opacity-50 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/15">
            <Landmark className="w-9 h-9" strokeWidth={2} />
          </div>
          <div>
            <div className="text-3xl xl:text-4xl font-extrabold leading-[1.05] tracking-tight">CAMPUS<br/>CONNECT</div>
            <div className="text-white/85 text-sm mt-2">Smart Campus. Connected Community.</div>
          </div>
        </div>

        <div className="relative mt-12">
          <div className="w-12 h-0.5 bg-white/40 mb-6" />
          <h2 className="text-2xl xl:text-3xl font-bold leading-tight">
            Welcome to <span className="text-white/85">Campus Connect</span>
          </h2>
          <p className="text-white/80 text-sm mt-3 max-w-md leading-relaxed">
            Your all-in-one platform for academics,<br/>communication and campus life.
          </p>
        </div>

        <div className="relative flex-1" />

        <div className="relative grid grid-cols-3 gap-3 p-5 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15">
          {[
            { icon: Shield, t: "Secure", d: "Your data is safe with us" },
            { icon: Zap, t: "Smart", d: "Powerful tools for better learning" },
            { icon: Heart, t: "Connected", d: "Bringing students, faculty & parents together" },
          ].map(f => (
            <div key={f.t}>
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-2">
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-bold">{f.t}</div>
              <div className="text-[11px] text-white/75 leading-snug mt-0.5">{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-soft border border-border/60 p-6 sm:p-8">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center text-white">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight">CAMPUS CONNECT</div>
              <div className="text-[11px] text-muted-foreground">Smart Campus. Connected Community.</div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back! <span className="inline-block">👋</span></h2>
          <p className="text-sm text-muted-foreground mt-1">Login to access your account</p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold">Username</label>
              <div className="mt-1.5 relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3 h-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Password</label>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 h-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-muted-foreground">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-primary font-semibold">Forgot Password?</Link>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Login as</div>
              <div className="grid grid-cols-4 gap-2">
                {roles.map(r => {
                  const active = role === r.id;
                  const Icon = r.icon;
                  return (
                    <button
                      type="button" key={r.id} onClick={() => setRole(r.id)}
                      className={`relative py-3 rounded-xl border-2 text-center transition-all ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40 bg-card"}`}
                    >
                      <Icon className={`w-5 h-5 mx-auto ${active ? "text-primary" : "text-primary/60"}`} strokeWidth={2} />
                      <div className="text-[11px] font-bold mt-1.5">{r.label}</div>
                      <span className={`absolute top-1.5 right-1.5 w-3 h-3 rounded-full border-2 flex items-center justify-center ${active ? "border-primary" : "border-muted-foreground/30"}`}>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl gradient-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70 shadow-elegant text-sm tracking-wider">
              {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "Signing in..." : "LOGIN  →"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={openContactModal} className="text-primary font-semibold cursor-pointer hover:underline">
                Contact Admin
              </button>
            </p>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>By logging in, you agree to our <a className="text-primary font-medium">Terms of Use</a> and <a className="text-primary font-medium">Privacy Policy.</a></span>
          </div>
        </div>
      </div>

      {/* ── Contact Admin Modal ──────────────────────────────────────────────── */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-md bg-card rounded-3xl shadow-elegant border border-border overflow-hidden">
            {/* Modal header */}
            <div className="gradient-hero text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-base">Contact Admin</div>
                  <div className="text-white/80 text-xs mt-0.5">We'll get back to you soon</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="font-semibold text-lg">Message Sent!</div>
                <p className="text-sm text-muted-foreground">The admin will get back to you soon.</p>
                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submitContact} className="p-6 space-y-4">
                {contactError && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{contactError}</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    disabled={contactLoading}
                    placeholder="Your full name"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    disabled={contactLoading}
                    placeholder="your@email.com"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    disabled={contactLoading}
                    placeholder="Describe your issue or request..."
                    className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-60"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {contactLoading
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                      : "Send Message"
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
