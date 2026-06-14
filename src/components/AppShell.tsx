import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Calendar, ClipboardList, BookOpen,
  Bell, Bot, MapPin, ExternalLink, User, Settings, LogOut, Menu, Search,
  Users, ClipboardCheck, UserCog, DollarSign, MessageSquare, BarChart3, X,
  Moon, Sun, ChevronDown, Landmark, History, FileText, Megaphone, Plane,
  Users2, ShieldCheck,
} from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { HelpChatbot } from "@/components/HelpChatbot";
import { useTheme, useSidebarStyle } from "@/lib/prefs";

interface NavItem { to: string; label: string; icon: any; badge?: number }

const navs: Record<Role, NavItem[]> = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/student/marks", label: "Marks", icon: GraduationCap },
    { to: "/student/chatbot", label: "AI Chatbot", icon: Bot },
    { to: "/student/navigation", label: "Campus Navigation", icon: MapPin },
    { to: "/student/timetable", label: "Timetable", icon: Calendar },
    { to: "/student/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/student/materials", label: "Study Materials", icon: BookOpen },
    { to: "/student/notifications", label: "Notifications", icon: Bell, badge: 3 },
    { to: "/student/portals", label: "External Portals", icon: ExternalLink },
    { to: "/student/profile", label: "Profile", icon: User },
    { to: "/student/settings", label: "Settings", icon: Settings },
  ],
  faculty: [
    { to: "/faculty", label: "Dashboard", icon: LayoutDashboard },
    { to: "/faculty/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/faculty/marks", label: "Marks", icon: GraduationCap },
    { to: "/faculty/timetable", label: "Timetable", icon: Calendar },
    { to: "/faculty/students", label: "Students", icon: Users },
    { to: "/faculty/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/faculty/materials", label: "Study Materials", icon: BookOpen },
    { to: "/faculty/leave", label: "Leave Requests", icon: Plane },
    { to: "/faculty/announcements", label: "Announcements", icon: Megaphone },
    { to: "/faculty/management", label: "Student Management", icon: UserCog },
    { to: "/faculty/chatbot", label: "AI Chatbot", icon: Bot },
    { to: "/faculty/navigation", label: "Campus Navigation", icon: MapPin },
    { to: "/faculty/portals", label: "External Portals", icon: ExternalLink },
    { to: "/faculty/notifications", label: "Notifications", icon: Bell, badge: 5 },
    { to: "/faculty/profile", label: "Profile", icon: User },
    { to: "/faculty/settings", label: "Settings", icon: Settings },
  ],
  parent: [
    { to: "/parent", label: "Dashboard", icon: LayoutDashboard },
    { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/parent/performance", label: "Academic Performance", icon: BarChart3 },
    { to: "/parent/timetable", label: "Timetable", icon: Calendar },
    { to: "/parent/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/parent/fees", label: "Fee Management", icon: DollarSign },
    { to: "/parent/notifications", label: "Notifications", icon: Bell, badge: 3 },
    { to: "/parent/chatbot", label: "AI Assistant", icon: Bot },
    { to: "/parent/navigation", label: "Campus Navigation", icon: MapPin },
    { to: "/parent/portals", label: "External Portals", icon: ExternalLink },
    { to: "/parent/profile", label: "Parent Profile", icon: User },
    { to: "/parent/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/students", label: "Student Management", icon: Users },
    { to: "/admin/faculty", label: "Faculty Management", icon: GraduationCap },
    { to: "/admin/parents", label: "Parent Management", icon: Users2 },
    { to: "/admin/attendance", label: "Attendance Management", icon: ClipboardCheck },
    { to: "/admin/marks", label: "Marks Management", icon: FileText },
    { to: "/admin/chatbot", label: "AI Chatbot Management", icon: Bot },
    { to: "/admin/navigation", label: "Campus Navigation", icon: MapPin },
    { to: "/admin/timetable", label: "Timetable Management", icon: Calendar },
    { to: "/admin/notifications", label: "Notification Management", icon: Bell, badge: 8 },
    { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    { to: "/admin/profile", label: "Profile", icon: User },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function AppShell({ role, children }: { role: Role; children?: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const [sidebarStyle] = useSidebarStyle();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const compact = sidebarStyle === "compact";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== role) navigate({ to: `/${user.role}` as any });
  }, [user, ready, role, navigate]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  const items = navs[role];
  const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-card border-r border-border transition-[transform,width] duration-200 ${
          compact ? "w-[244px] lg:w-[76px]" : "w-[244px]"
        } ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
      >
        {/* Branding block */}
        <div className={`cc-brand ${compact ? "lg:px-2 lg:py-4" : ""}`}>
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="cc-brand-logo">
              <Landmark className="w-8 h-8" strokeWidth={2} />
            </div>
            <div className={`flex-1 min-w-0 ${compact ? "lg:hidden" : ""}`}>
              <div className="font-extrabold text-[15px] leading-[1.05] tracking-tight text-white">CAMPUS<br/>CONNECT</div>
              <div className="text-[9.5px] mt-1 font-medium text-white/80 leading-tight">Smart Campus. Connected Community.</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden text-white/80 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="cc-scroll flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {items.map((it) => {
            const active = it.to === `/${role}`
              ? location.pathname === it.to
              : location.pathname === it.to || location.pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to as any}
                title={compact ? it.label : undefined}
                className={`group relative flex items-center gap-3 px-3.5 h-10 rounded-xl text-[13.5px] font-medium transition-colors duration-150 ${
                  compact ? "lg:justify-center lg:px-0" : ""
                } ${
                  active
                    ? "bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white shadow-[0_4px_12px_-4px_oklch(0.52_0.21_285_/_0.45)] font-semibold"
                    : "text-foreground/70 hover:bg-primary/8 hover:text-primary"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.3 : 1.9} />
                <span className={`flex-1 truncate ${compact ? "lg:hidden" : ""}`}>{it.label}</span>
                {it.badge && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 min-w-[20px] h-5 inline-flex items-center justify-center ${compact ? "lg:hidden" : ""} ${
                    active ? "bg-white/25 text-white" : "bg-primary text-white"
                  }`}>{it.badge}</span>
                )}
                {compact && it.badge && (
                  <span className="hidden lg:block absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
                )}
              </Link>
            );
          })}

          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            title={compact ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3.5 h-10 rounded-xl text-[13.5px] font-medium text-foreground/70 hover:bg-primary/8 hover:text-primary transition-colors duration-150 ${compact ? "lg:justify-center lg:px-0" : ""}`}
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.9} /> <span className={compact ? "lg:hidden" : ""}>Logout</span>
          </button>
        </nav>

        {/* Need Help card */}
        <div className={`p-3 ${compact ? "lg:hidden" : ""}`}>
          <div className="rounded-xl p-3.5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/15">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="text-[13px] font-bold">Need Help?</div>
            </div>
            <p className="text-[10.5px] text-muted-foreground leading-snug mb-2.5">
              Ask our AI assistant anytime, anywhere.
            </p>
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-[11.5px] font-bold shadow-[0_4px_12px_-4px_oklch(0.52_0.21_285_/_0.45)] hover:shadow-[0_6px_16px_-4px_oklch(0.52_0.21_285_/_0.6)] transition-shadow"
            >
              Open Chatbot →
            </button>
          </div>
        </div>
        {compact && (
          <div className="hidden lg:flex p-2 justify-center">
            <button
              onClick={() => setHelpOpen(true)}
              title="Open Help Assistant"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white inline-flex items-center justify-center shadow-md"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden" />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 h-[68px]">
            <button
              className="p-2 rounded-lg hover:bg-muted text-foreground/70"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-2xl hidden sm:flex items-center gap-2 px-4 h-11 rounded-full bg-muted/60 border border-border/60">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search anything (classes, teachers, events…)"
                className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
              />
              <History className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 sm:hidden" />

            <button onClick={toggleTheme} aria-label="Toggle dark mode" className="p-2 rounded-full hover:bg-muted text-muted-foreground hidden sm:inline-flex">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to={`/${role}/notifications` as any}
              className="relative p-2 rounded-full hover:bg-muted text-foreground/70"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-[22px] h-[22px]" strokeWidth={1.8} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-primary text-white inline-flex items-center justify-center font-bold ring-2 ring-card">
                {items.find(i => i.label.toLowerCase().includes("notification"))?.badge ?? 3}
              </span>
            </Link>

            <Link
              to={`/${role}/notifications` as any}
              className="relative p-2 rounded-full hover:bg-muted text-foreground/70"
              aria-label="Messages"
              title="Messages"
            >
              <MessageSquare className="w-[22px] h-[22px]" strokeWidth={1.8} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] rounded-full bg-rose-500 text-white inline-flex items-center justify-center font-bold ring-2 ring-card">1</span>
            </Link>

            <Link
              to={`/${role}/timetable` as any}
              className="p-2 rounded-full hover:bg-muted text-foreground/70 hidden md:inline-flex"
              aria-label="Calendar"
              title="Timetable"
            >
              <Calendar className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </Link>

            <ProfileMenu role={role} name={user.name} subtitle={user.subtitle} initials={initials} onLogout={() => { logout(); navigate({ to: "/login" }); }} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children ?? <Outlet />}
        </main>
      </div>
      <HelpChatbot open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function ProfileMenu({ role, name, subtitle, initials, onLogout }: { role: Role; name: string; subtitle?: string; initials: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const items: Array<{ to?: string; label: string; icon: any; onClick?: () => void; danger?: boolean }> = [
    { to: `/${role}/profile`, label: "View Profile", icon: User },
    { to: `/${role}/profile`, label: "Edit Profile", icon: UserCog },
    { to: `/${role}/settings`, label: "Account Settings", icon: Settings },
    { to: `/${role}/notifications`, label: "Notifications", icon: Bell },
    { label: "Logout", icon: LogOut, onClick: onLogout, danger: true },
  ];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 sm:border-l sm:border-border rounded-r-full hover:bg-muted/50 py-1 pr-2 transition-colors"
        aria-label="Account menu"
      >
        <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-soft">{initials}</div>
        <div className="hidden md:block leading-tight text-left">
          <div className="text-sm font-bold">{name === "Student" ? "Student" : `Hi, ${name}`}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle?.includes(" | ") ? subtitle.split(" | ")[0] : subtitle}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground hidden md:block transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent border-b border-border">
            <div className="font-bold text-sm truncate">{name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{subtitle?.includes(" | ") ? subtitle.split(" | ")[0] : subtitle}</div>
          </div>
          <div className="p-1.5">
            {items.map((it, i) => it.to ? (
              <Link
                key={i}
                to={it.to as any}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm text-foreground/80 hover:bg-primary/8 hover:text-primary transition-colors"
              >
                <it.icon className="w-4 h-4" /> {it.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => { setOpen(false); it.onClick?.(); }}
                className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-colors ${it.danger ? "text-rose-600 hover:bg-rose-500/10" : "text-foreground/80 hover:bg-primary/8 hover:text-primary"}`}
              >
                <it.icon className="w-4 h-4" /> {it.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tint = "violet", sub, to }: { icon: any; label: string; value: ReactNode; tint?: string; sub?: string; to?: string }) {
  const tints: Record<string, { icon: string; surface: string; ring: string; accent: string; shadow: string }> = {
    violet: {
      icon: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_8px_20px_-6px_rgba(139,92,246,0.55)]",
      surface: "bg-gradient-to-br from-violet-50 via-white to-white dark:from-violet-500/10 dark:via-card dark:to-card",
      ring: "border-violet-200/70 dark:border-violet-400/20",
      accent: "text-violet-600 dark:text-violet-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(139,92,246,0.45)]",
    },
    emerald: {
      icon: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.55)]",
      surface: "bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-500/10 dark:via-card dark:to-card",
      ring: "border-emerald-200/70 dark:border-emerald-400/20",
      accent: "text-emerald-600 dark:text-emerald-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(16,185,129,0.45)]",
    },
    amber: {
      icon: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_20px_-6px_rgba(245,158,11,0.55)]",
      surface: "bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-500/10 dark:via-card dark:to-card",
      ring: "border-amber-200/70 dark:border-amber-400/20",
      accent: "text-amber-600 dark:text-amber-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(245,158,11,0.45)]",
    },
    rose: {
      icon: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.55)]",
      surface: "bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-500/10 dark:via-card dark:to-card",
      ring: "border-rose-200/70 dark:border-rose-400/20",
      accent: "text-rose-600 dark:text-rose-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(244,63,94,0.45)]",
    },
    blue: {
      icon: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.55)]",
      surface: "bg-gradient-to-br from-sky-50 via-white to-white dark:from-sky-500/10 dark:via-card dark:to-card",
      ring: "border-sky-200/70 dark:border-sky-400/20",
      accent: "text-sky-600 dark:text-sky-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(59,130,246,0.45)]",
    },
    fuchsia: {
      icon: "bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-[0_8px_20px_-6px_rgba(217,70,239,0.55)]",
      surface: "bg-gradient-to-br from-fuchsia-50 via-white to-white dark:from-fuchsia-500/10 dark:via-card dark:to-card",
      ring: "border-fuchsia-200/70 dark:border-fuchsia-400/20",
      accent: "text-fuchsia-600 dark:text-fuchsia-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(217,70,239,0.45)]",
    },
    orange: {
      icon: "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_8px_20px_-6px_rgba(249,115,22,0.55)]",
      surface: "bg-gradient-to-br from-orange-50 via-white to-white dark:from-orange-500/10 dark:via-card dark:to-card",
      ring: "border-orange-200/70 dark:border-orange-400/20",
      accent: "text-orange-600 dark:text-orange-300",
      shadow: "hover:shadow-[0_12px_28px_-12px_rgba(249,115,22,0.45)]",
    },
  };
  const t = tints[tint] ?? tints.violet;
  const inner = (
    <>
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl ${t.icon.split(' ').filter(c => c.startsWith('from-') || c.startsWith('to-') || c.startsWith('bg-gradient')).join(' ')}`} aria-hidden />
      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${t.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="relative min-w-0">
        <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground truncate">{label}</div>
        {sub && <div className={`text-xs font-semibold mt-0.5 ${t.accent}`}>{sub}</div>}
      </div>
    </>
  );
  const cls = `relative overflow-hidden rounded-2xl p-5 border ${t.ring} ${t.surface} shadow-soft ${t.shadow} transition-all flex items-center gap-4`;
  if (to) {
    return <Link to={to as any} className={`${cls} hover:-translate-y-0.5 cursor-pointer`}>{inner}</Link>;
  }
  return <div className={cls}>{inner}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card rounded-2xl shadow-soft border border-border ${className}`}>{children}</div>;
}
