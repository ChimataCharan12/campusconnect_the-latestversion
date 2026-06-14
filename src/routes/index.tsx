import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Bot, BarChart3, Bell, ShieldCheck, MapPin, Play, GraduationCap,
  Globe, CalendarCheck, Trophy, ClipboardList, BookOpen, Briefcase, Linkedin, Instagram,
  CheckSquare, Clock, FileText, Sparkles, Building2, Users, UserCog, Rocket, Server, Search,
  Menu,
} from "lucide-react";
import appLogo from "@/assets/mvsr-logo.jpg";
import brandingLogo from "@/assets/mvsr-logo.jpg";
import navIllustration from "@/assets/campus-navigation.jpg";
import aiRobot from "@/assets/ai-chatbot.jpg";
import studentsPhoto from "@/assets/students-photo.jpg";
import facultyPhoto from "@/assets/faculty-photo.jpg";
import parentsPhoto from "@/assets/parents-photo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MVSR Campus Connect — AI-Powered Smart Campus Management System" },
      { name: "description", content: "AI-Powered Smart Campus Management System for MVSR Engineering College. Attendance, marks, timetables, study materials, navigation, notifications, and AI academic assistance." },
      { property: "og:title", content: "MVSR Campus Connect" },
      { property: "og:description", content: "AI-Powered Smart Campus Management System for MVSR Engineering College." },
    ],
  }),
  component: Landing,
});

const navLinks = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "modules", label: "Modules" },
  { id: "ai", label: "AI Assistant" },
  { id: "about", label: "About MVSR" },
  { id: "contact", label: "Contact" },
];

function Landing() {
  return (
    <div className="dark">
      <div className="relative min-h-screen overflow-hidden bg-[oklch(0.10_0.03_275)] text-foreground">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[oklch(0.55_0.25_300/0.25)] blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full bg-[oklch(0.55_0.25_260/0.20)] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[oklch(0.55_0.25_320/0.18)] blur-3xl" />
        </div>

        {/* NAVBAR */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.10_0.03_275/0.7)] border-b border-white/10">
          <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
            <a href="#home" className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.5)] shrink-0">
                <img src={appLogo} alt="MVSR Engineering College" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide text-white">
                  MVSR <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">CAMPUS CONNECT</span>
                </div>
                <div className="text-[10px] text-white/60 hidden sm:block">AI-Powered Smart Campus Management</div>
              </div>
            </a>
            <nav className="hidden lg:flex items-center gap-7 text-sm">
              {navLinks.map(l => (
                <a key={l.id} href={`#${l.id}`} className="text-white/70 hover:text-white transition-colors">{l.label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login" className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_24px_rgba(168,85,247,0.55),0_0_44px_rgba(59,130,246,0.30)] hover:shadow-[0_0_36px_rgba(168,85,247,0.75),0_0_60px_rgba(59,130,246,0.45)] transition-all">
                Login <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button className="lg:hidden p-2 text-white/80" aria-label="Menu"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section id="home" className="relative max-w-7xl mx-auto px-4 md:px-6 pt-6 lg:pt-8 pb-0">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* LEFT */}
            <div>
              {/* Compact badge — NO outer glow container */}
              <div className="inline-flex items-center gap-3 px-3.5 py-2 mb-5 rounded-xl border border-violet-400/30 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.35)]">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0">
                  <img src={appLogo} alt="MVSR" className="w-full h-full object-contain rounded-full" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-wide text-white">MVSR ENGINEERING COLLEGE</div>
                  <div className="text-[11px] text-white/60">Hyderabad, Telangana</div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold leading-[1.08] tracking-tight text-white">
                <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(217,70,239,0.5)]">AI-Powered</span><br />
                Smart Campus<br />
                Management System<br />
                <span className="text-white/90">for </span>
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">MVSR Engineering College</span>
              </h1>

              <p className="mt-5 text-white/70 max-w-xl leading-relaxed text-sm">
                A unified platform for attendance, marks, timetables, study materials, campus navigation, notifications, and AI-powered academic assistance.
              </p>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <FeatureMini icon={Bot}        title="AI Academic Assistant" />
                <FeatureMini icon={BarChart3}  title="Real-time Dashboards" />
                <FeatureMini icon={Bell}       title="Instant Notifications" />
                <FeatureMini icon={ShieldCheck}title="Secure & Reliable" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_32px_rgba(168,85,247,0.7),0_0_60px_rgba(59,130,246,0.4)] hover:translate-y-[-1px] transition-all">
                  Explore Campus Connect <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#modules" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/90 bg-white/5 border border-white/15 hover:bg-white/10 transition-colors">
                  <Play className="w-4 h-4" /> View All Modules
                </a>
              </div>

              {/* Highlight card */}
              <div className="mt-5 relative rounded-2xl p-px bg-gradient-to-br from-fuchsia-500/50 via-violet-500/30 to-blue-500/50 shadow-[0_0_28px_rgba(168,85,247,0.35)]">
                <div className="rounded-2xl bg-[oklch(0.13_0.03_275)]/80 backdrop-blur-xl px-4 py-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.55)] shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[13px] font-bold text-white">AI-Powered Smart Campus Management System for</div>
                    <div className="text-[13px] font-bold bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">MVSR Engineering College</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Dashboard preview + AI/Nav row */}
            <div className="space-y-4">
              <DashboardPreview />
              <div className="grid sm:grid-cols-[1.25fr_1fr] gap-4">
                <AICard />
                <NavCard />
              </div>
            </div>
          </div>
        </section>

        {/* PORTALS */}
        <section id="features" className="max-w-7xl mx-auto px-4 md:px-6 mt-10 pb-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <SectionTitle center>Official MVSR Portals</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 w-full">
                <PortalCard icon={Globe} label="MVSR Official Website" href="https://mvsrec.edu.in" color="violet" />
                <PortalCard icon={CalendarCheck} label="MVSR Attendance Portal" href="https://mvsrec.edu.in" color="violet" />
                <PortalCard icon={Trophy} label="MVSR Results Portal" href="https://mvsrec.edu.in" color="orange" />
                <PortalCard icon={ClipboardList} label="Student Opinion Poll (SOP)" href="https://mvsrec.edu.in" color="violet" />
                <PortalCard icon={BookOpen} label="Library & Resources" href="https://mvsrec.edu.in" color="violet" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <SectionTitle center>Student Career & Learning Platforms</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 w-full">
                <PortalCard icon={GraduationCap} label="EduSkills Platform" href="https://eduskillsfoundation.org" color="blue" />
                <PortalCard icon={Briefcase} label="AICTE Internship Portal" href="https://internship.aicte-india.org" color="orange" />
                <PortalCard icon={Linkedin} label="MVSR Official LinkedIn" href="https://linkedin.com" color="blue" />
                <PortalCard icon={Instagram} label="MVSR Official Instagram" href="https://instagram.com" color="pink" />
              </div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section id="modules" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <SectionTitle center>Core Modules to Simplify Campus Life</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <ModuleCard icon={CheckSquare} title="Attendance Management" desc="Track attendance in real-time with smart analytics and detailed reports." accent="violet" />
            <ModuleCard icon={BarChart3}   title="Marks Management"      desc="View internal marks, exam results, CGPA and academic performance." accent="blue" />
            <ModuleCard icon={Clock}       title="Timetable Management"  desc="Access personalized class timetables and room schedules." accent="cyan" />
            <ModuleCard icon={FileText}    title="Assignments"           desc="Submit assignments, check deadlines and receive feedback." accent="orange" />
            <ModuleCard icon={BookOpen}    title="Study Materials"       desc="Access notes, PDFs, question papers and learning resources." accent="violet" />
            <ModuleCard icon={Bot}         title="AI Chatbot Assistant"  desc="Get instant answers to your academic and campus queries." accent="blue" />
            <ModuleCard icon={MapPin}      title="Campus Navigation"     desc="Find classrooms, labs, offices, departments and facilities easily." accent="emerald" />
            <ModuleCard icon={Bell}        title="Notifications"         desc="Stay updated with important announcements and real-time alerts." accent="orange" />
          </div>
        </section>

        {/* MEMBERS */}
        <section id="ai" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <SectionTitle center>Designed for Every MVSR Member</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <MemberCard
              title="For Students" icon={GraduationCap} accent="violet" photo={studentsPhoto}
              features={["Attendance, Marks & Timetable", "Study Materials & Assignments", "AI Assistant & Notifications", "Academic Performance"]}
              cta="Student Portal"
            />
            <MemberCard
              title="For Faculty" icon={Users} accent="blue" photo={facultyPhoto}
              features={["Manage classes & attendance", "Publish materials & updates", "Evaluate performance", "Communicate efficiently"]}
              cta="Faculty Portal"
            />
            <MemberCard
              title="For Parents" icon={UserCog} accent="pink" photo={parentsPhoto}
              features={["Track child attendance", "View marks & performance", "Timetable & notifications", "Stay connected always"]}
              cta="Parent Portal"
            />
          </div>
        </section>

        {/* FOOTER STRIP */}
        <section id="about" className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <GlowCard className="p-6 md:p-8">
            <div className="grid md:grid-cols-4 gap-6 items-center">
              <FooterFeature icon={ShieldCheck} title="Secure & Private" desc="Your data is protected with advanced security." color="text-violet-300" />
              <FooterFeature icon={Server}      title="Reliable System"  desc="Built for performance, stability and reliability." color="text-blue-300" />
              <FooterFeature icon={Rocket}      title="Smart & Innovative" desc="AI-powered features for a smarter campus." color="text-fuchsia-300" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white p-1 flex items-center justify-center shrink-0">
                  <img src={brandingLogo} alt="MVSR" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">MVSR Engineering College</div>
                  <div className="text-xs text-white/60">Empowering Education.<br />Inspiring Excellence.</div>
                </div>
              </div>
            </div>
          </GlowCard>
        </section>

        {/* FOOTER */}
        <footer id="contact" className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-white/55">© 2026 Campus Connect — MVSR Engineering College. All rights reserved.</div>
            <div className="text-xs text-white/55">Proudly built for the MVSR Community 💜</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-fuchsia-500/50 via-violet-500/30 to-blue-500/50 p-px shadow-[0_0_28px_rgba(168,85,247,0.35),0_0_56px_rgba(59,130,246,0.22)]">
      <div className={`relative rounded-2xl border border-white/5 bg-[oklch(0.13_0.03_275)]/70 backdrop-blur-xl ${className}`}>
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-fuchsia-400/60" />
      <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">{children}</h2>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-violet-400/60" />
    </div>
  );
}

function FeatureMini({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-violet-300" />
      </div>
      <div className="text-[12px] font-semibold text-white leading-tight">{title}</div>
    </div>
  );
}

/* dashboard preview */
function DashboardPreview() {
  const sidebar = [
    { label: "Dashboard", active: true },
    "Attendance", "Marks", "Timetable", "Assignments",
    "Study Materials", "AI Assistant", "Campus Navigation",
    "Notifications", "Profile", "Settings",
  ];
  const stats = [
    { label: "Attendance", value: "92%", sub: "This Month", color: "from-violet-500 to-blue-500" },
    { label: "CGPA",       value: "8.45", sub: "Current Semester", color: "from-emerald-500 to-teal-500" },
    { label: "Assignments",value: "5",    sub: "Pending", color: "from-orange-500 to-amber-500" },
    { label: "Notifications", value: "3", sub: "Unread", color: "from-pink-500 to-rose-500" },
  ];
  return (
    <GlowCard className="p-3 md:p-4">
      {/* topbar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <img src={appLogo} alt="" className="w-6 h-6 object-contain" />
          <span className="text-xs font-semibold text-white">Campus Connect</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/50 w-56">
          <Search className="w-3.5 h-3.5" /> Search anything...
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/70" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* sidebar */}
        <aside className="col-span-4 sm:col-span-3 rounded-xl bg-white/[0.03] border border-white/10 p-2 text-[11px]">
          {sidebar.map((s, i) => {
            const item = typeof s === "string" ? { label: s, active: false } : s;
            return (
              <div key={i} className={`px-2 py-1.5 rounded-md mb-0.5 ${item.active ? "bg-gradient-to-r from-violet-500/40 to-blue-500/30 text-white font-semibold" : "text-white/60 hover:text-white"}`}>
                {item.label}
              </div>
            );
          })}
        </aside>

        {/* main */}
        <div className="col-span-8 sm:col-span-9 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-sm font-semibold text-white">Welcome back, Ananya 👋</div>
            <div className="text-[11px] text-white/55">Here's what's happening at MVSR Engineering College</div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${s.color} mb-1.5`} />
                <div className="text-[10px] text-white/55">{s.label}</div>
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[9px] text-white/45">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[11px] font-semibold text-white mb-1.5">Today's Schedule</div>
              {[
                ["09:00", "Data Structures", "CSE - Room 305"],
                ["11:00", "Operating Systems", "CSE - Room 105"],
                ["02:00", "Lab: DBMS", "CSE Lab - 3"],
              ].map(([t, c, r]) => (
                <div key={t} className="flex gap-2 py-1 border-t border-white/5 first:border-0">
                  <div className="text-[10px] text-violet-300 font-mono">{t}</div>
                  <div>
                    <div className="text-[10px] text-white font-medium">{c}</div>
                    <div className="text-[9px] text-white/45">{r}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <div className="text-[11px] font-semibold text-white mb-1.5">Attendance Overview</div>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-20 h-20 rounded-full" style={{
                  background: "conic-gradient(oklch(0.65 0.22 285) 0 92%, oklch(0.25 0.05 270) 92% 100%)"
                }}>
                  <div className="absolute inset-2 rounded-full bg-[oklch(0.15_0.03_275)] flex flex-col items-center justify-center">
                    <div className="text-sm font-bold text-white">92%</div>
                    <div className="text-[8px] text-white/55">Overall</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-white/60">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Present</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Absent</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Late</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Leave</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

function AICard() {
  return (
    <GlowCard className="p-4 overflow-hidden">
      <div className="flex justify-center mb-2">
        <div className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-violet-200 bg-violet-500/20 border border-violet-400/30">⏵ VOICE ASSISTANT</div>
      </div>
      <div className="grid grid-cols-[38%_1fr] gap-4 items-center">
        <div className="relative aspect-square">
          <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_50%_55%,rgba(168,85,247,0.45),transparent_70%)] blur-xl" />
          <img
            src={aiRobot}
            alt="AI Assistant robot"
            className="relative w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="text-base font-bold text-white mb-2">AI Academic Assistant</div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-white/85">
            {["Academic Queries","Timetable Assistance","Attendance Information","Campus Guidance","Marks & Performance","Voice Interaction","Real-time Responses","Real-time Responses"].map((t,i) => (
              <li key={i} className="flex items-center gap-1.5"><span className="text-violet-300">✓</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_24px_rgba(168,85,247,0.55),0_0_40px_rgba(59,130,246,0.28)]">
          Start Chat <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </GlowCard>
  );
}

function NavCard() {
  return (
    <GlowCard className="p-4 flex flex-col overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-[0_0_24px_oklch(0.55_0.25_320/0.5)] shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">Campus Navigation</div>
          <div className="text-[11px] text-white/65 leading-snug mt-1">Navigate across MVSR campus with interactive maps.</div>
        </div>
      </div>
      <div className="mt-3 relative w-full aspect-[4/3] max-h-40 overflow-hidden rounded-xl flex items-center justify-center">
        <img
          src={navIllustration}
          alt="Campus navigation map illustration"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_24px_rgba(168,85,247,0.55),0_0_40px_rgba(59,130,246,0.28)]">
          Open Campus Map <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </GlowCard>
  );
}

const colorMap: Record<string, string> = {
  violet:  "from-violet-500 to-purple-500   shadow-[0_0_28px_rgba(168,85,247,0.6),0_0_46px_rgba(59,130,246,0.25)]",
  blue:    "from-blue-500 to-cyan-500       shadow-[0_0_28px_rgba(59,130,246,0.6),0_0_46px_rgba(168,85,247,0.25)]",
  cyan:    "from-cyan-400 to-teal-400       shadow-[0_0_28px_rgba(34,211,238,0.55),0_0_46px_rgba(59,130,246,0.25)]",
  orange:  "from-orange-500 to-amber-500    shadow-[0_0_28px_rgba(251,146,60,0.75),0_0_46px_rgba(251,113,33,0.4)]",
  emerald: "from-emerald-500 to-teal-500    shadow-[0_0_28px_rgba(16,185,129,0.55),0_0_46px_rgba(59,130,246,0.20)]",
  pink:    "from-pink-500 to-rose-500       shadow-[0_0_28px_rgba(236,72,153,0.6),0_0_46px_rgba(168,85,247,0.25)]",
};

const cardGlow: Record<string, { border: string; shadow: string; hoverShadow: string }> = {
  violet:  { border: "border-violet-400/25",  shadow: "shadow-[0_0_22px_rgba(168,85,247,0.25),inset_0_0_22px_rgba(168,85,247,0.06)]", hoverShadow: "hover:shadow-[0_0_34px_rgba(168,85,247,0.55),inset_0_0_28px_rgba(168,85,247,0.12)]" },
  blue:    { border: "border-blue-400/25",    shadow: "shadow-[0_0_22px_rgba(59,130,246,0.28),inset_0_0_22px_rgba(59,130,246,0.06)]", hoverShadow: "hover:shadow-[0_0_34px_rgba(59,130,246,0.55),inset_0_0_28px_rgba(59,130,246,0.12)]" },
  cyan:    { border: "border-cyan-400/30",    shadow: "shadow-[0_0_22px_rgba(34,211,238,0.28),inset_0_0_22px_rgba(34,211,238,0.06)]", hoverShadow: "hover:shadow-[0_0_34px_rgba(34,211,238,0.55),inset_0_0_28px_rgba(34,211,238,0.12)]" },
  orange:  { border: "border-orange-400/45",  shadow: "shadow-[0_0_24px_rgba(251,146,60,0.45),inset_0_0_24px_rgba(251,146,60,0.10)]", hoverShadow: "hover:shadow-[0_0_38px_rgba(251,146,60,0.75),inset_0_0_30px_rgba(251,146,60,0.18)]" },
  emerald: { border: "border-emerald-400/25", shadow: "shadow-[0_0_22px_rgba(16,185,129,0.25),inset_0_0_22px_rgba(16,185,129,0.06)]", hoverShadow: "hover:shadow-[0_0_34px_rgba(16,185,129,0.5),inset_0_0_28px_rgba(16,185,129,0.12)]" },
  pink:    { border: "border-pink-400/30",    shadow: "shadow-[0_0_22px_rgba(236,72,153,0.30),inset_0_0_22px_rgba(236,72,153,0.06)]", hoverShadow: "hover:shadow-[0_0_34px_rgba(236,72,153,0.55),inset_0_0_28px_rgba(236,72,153,0.12)]" },
};

function PortalCard({ icon: Icon, label, href, color }: { icon: any; label: string; href: string; color: keyof typeof colorMap }) {
  const g = cardGlow[color];
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`group rounded-xl border ${g.border} bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-3 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center ${g.shadow} ${g.hoverShadow} backdrop-blur-xl`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-[11px] font-semibold text-white/90 leading-tight">{label}</div>
    </a>
  );
}

function ModuleCard({ icon: Icon, title, desc, accent }: { icon: any; title: string; desc: string; accent: keyof typeof colorMap }) {
  const g = cardGlow[accent];
  return (
    <Link to="/login" className={`group rounded-2xl border ${g.border} bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-4 hover:-translate-y-1 transition-all flex flex-col ${g.shadow} ${g.hoverShadow} backdrop-blur-xl`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[accent]} flex items-center justify-center mb-2.5`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="text-[11.5px] text-white/60 mt-1 leading-snug flex-1">{desc}</div>
      <div className="mt-2.5 text-[12px] font-semibold inline-flex items-center gap-1 text-violet-300 group-hover:gap-2 transition-all">
        Explore <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

function MemberCard({ title, icon: Icon, features, cta, accent, photo }: { title: string; icon: any; features: string[]; cta: string; accent: keyof typeof colorMap; photo: string }) {
  return (
    <GlowCard className="p-0 overflow-hidden flex flex-col">
      <div className="relative grid grid-cols-[1fr_42%] gap-0 p-4">
        {/* Left: title + checklist */}
        <div className="relative z-10 pr-3">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[accent]} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-bold text-white">{title}</div>
          </div>
          <ul className="space-y-1.5">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-[11.5px] text-white/80">
                <span className="text-violet-300">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
        {/* Right: blended photo */}
        <div className="relative h-full min-h-[150px] rounded-xl overflow-hidden">
          <img src={photo} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[oklch(0.13_0.03_275)] to-transparent" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <Link to="/login" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow-[0_0_28px_rgba(168,85,247,0.6),0_0_48px_rgba(59,130,246,0.30)] hover:translate-y-[-1px] transition-transform">
          {cta} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </GlowCard>
  );
}

function FooterFeature({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className={`text-sm font-bold ${color}`}>{title}</div>
        <div className="text-[11px] text-white/60 leading-snug mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
