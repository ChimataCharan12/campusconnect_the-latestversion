import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { ExternalLink, ShieldCheck, Lock, BadgeCheck, Search, Building, GraduationCap, Briefcase, BookOpen, Award, Instagram, Linkedin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { portals as portalData } from "@/lib/mock";

export const Route = createFileRoute("/parent/portals")({ component: Page });

const iconMap: Record<string, any> = {
  "MVSR College Official Website": Building,
  "MVSR Attendance Portal": GraduationCap,
  "MVSR Results Portal": Award,
  "Eduskills Portal": BookOpen,
  "AICTE Internship Portal": Briefcase,
  "Student Opinion Poll (SOP) Portal": MessageSquare,
  "MVSR Official Instagram": Instagram,
  "MVSR LinkedIn Page": Linkedin,
};
const portals = portalData.map(p => ({ ...p, icon: iconMap[p.name] ?? Building }));

const tint: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
};

function Page() {
  const [q, setQ] = useState("");
  const filtered = portals.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="External Portal Integration" subtitle="Secure access to official MVSR systems for parents." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 gradient-soft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center"><Lock className="w-5 h-5" /></div>
              <div>
                <h3 className="font-semibold">Your Security, Our Priority</h3>
                <p className="text-xs text-muted-foreground">All redirections are safe, verified and encrypted.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /><span><strong>Secure Redirection</strong><br /><span className="text-muted-foreground">Encrypted</span></span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /><span><strong>Privacy Protected</strong><br /><span className="text-muted-foreground">No data stored</span></span></div>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary" /><span><strong>Verified</strong><br /><span className="text-muted-foreground">Trusted partners</span></span></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search portals..." className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </Card>

          <div>
            <h3 className="font-semibold mb-3">Official External Portals</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map(p => (
                <Card key={p.name} className="p-5 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tint[p.color]}`}><p.icon className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{p.name}</h4>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.desc}</div>
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">Verified</span>
                    </div>
                  </div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2.5 rounded-xl bg-primary/8 text-primary text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors">Go to Portal <ExternalLink className="w-4 h-4" /></a>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Security Status</h3>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><ShieldCheck className="w-8 h-8" /></div>
              <div className="font-semibold mt-2">All Systems Secure</div>
              <div className="text-xs text-muted-foreground">Last checked: today 09:30 AM</div>
            </div>
            <ul className="mt-4 text-sm space-y-2">
              <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" /> Secure HTTPS Connection</li>
              <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" /> Verified Official Domains</li>
              <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" /> No Data Storage</li>
              <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-emerald-500" /> Privacy Protection Enabled</li>
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Safety Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>🔒 Always check the domain before entering credentials.</li>
              <li>🤫 Never share your login with anyone.</li>
              <li>🛡️ Campus Connect never asks for your password.</li>
              <li>🚨 Report suspicious activity to the admin.</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-gradient-to-r from-[oklch(0.48_0.22_285)] to-[oklch(0.40_0.22_285)] text-white flex flex-wrap items-center justify-between gap-4 shadow-elegant">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
          <div className="min-w-0">
            <div className="font-bold">Safe Redirection</div>
            <div className="text-xs text-white/80">You will be redirected to the official website. Campus Connect does not collect any data on these portals.</div>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors">Learn More</button>
      </div>
    </div>
  );
}
