import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Bell, Lock, Globe, User, Moon, Sun, Monitor, Check, Palette } from "lucide-react";
import { useTheme } from "@/lib/prefs";

export const Route = createFileRoute("/parent/settings")({ component: Page });

function Page() {
  const [theme, setTheme] = useTheme();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account, notifications and preferences." />
      <Card className="p-6 max-w-2xl">
        <h3 className="font-semibold flex items-center gap-2 mb-1"><Palette className="w-4 h-4" /> Appearance</h3>
        <p className="text-xs text-muted-foreground mb-3">Choose how Campus Connect looks for you.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: "light", l: "Light", i: Sun },
            { v: "dark", l: "Dark", i: Moon },
            { v: "system", l: "System", i: Monitor },
          ].map(o => (
            <button key={o.v} onClick={() => setTheme(o.v as any)} className={`relative p-4 rounded-xl border-2 transition-colors text-center ${theme === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              {theme === o.v && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"><Check className="w-3 h-3" /></span>}
              <o.i className="w-6 h-6 mx-auto text-primary" />
              <div className="text-sm font-semibold mt-2">{o.l}</div>
            </button>
          ))}
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-6">
        {[
          { icon: User, title: "Account", desc: "Update your name, email and contact info." },
          { icon: Lock, title: "Security", desc: "Change password and enable 2FA." },
          { icon: Bell, title: "Notifications", desc: "Choose what alerts you want to receive." },
          { icon: Globe, title: "Language", desc: "Choose your preferred language." },
        ].map((s, i) => (
          <Card key={i} className="p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><s.icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                <button className="mt-3 text-sm font-semibold text-primary">Manage →</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
