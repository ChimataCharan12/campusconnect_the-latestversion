import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Moon, Sun, Bell, Lock, Globe, Palette, Monitor, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/prefs";

export const Route = createFileRoute("/student/settings")({ component: Page });

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`} />
  </button>;
}

function Page() {
  const [theme, setTheme] = useTheme();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage preferences and account options." />
      <Card className="p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Palette className="w-4 h-4" /> Theme</h3>
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
      <Card className="divide-y divide-border">
        {[
          { i: Bell, label: "Push Notifications", desc: "Receive instant updates", v: push, s: setPush },
          { i: Globe, label: "Email Notifications", desc: "Receive emails for important updates", v: email, s: setEmail },
          { i: Lock, label: "Privacy Mode", desc: "Hide profile from public", v: privacy, s: setPrivacy },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><s.i className="w-5 h-5" /></div>
            <div className="flex-1"><div className="font-medium">{s.label}</div><div className="text-xs text-muted-foreground">{s.desc}</div></div>
            <Toggle value={s.v} onChange={s.s} />
          </div>
        ))}
      </Card>
    </div>
  );
}
