import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Bell, Moon, Globe, Lock, Smartphone, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faculty/settings")({ component: Page });

function Page() {
  const [push, setPush] = useState(true);
  const [emailN, setEmailN] = useState(true);
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your preferences and account settings." />
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
          <Row icon={Smartphone} label="Push Notifications" desc="Receive alerts on this device" value={push} onChange={setPush} />
          <Row icon={Mail} label="Email Notifications" desc="Get a daily digest by email" value={emailN} onChange={setEmailN} />
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Moon className="w-4 h-4" /> Appearance</h3>
          <Row icon={Moon} label="Dark Mode" desc="Reduce eye strain in low light" value={dark} onChange={(v: boolean) => { setDark(v); document.documentElement.classList.toggle("dark", v); localStorage.setItem("cc_dark", v ? "1" : "0"); }} />
          <Field icon={Globe} label="Language" v="English (India)" />
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Security</h3>
          <LinkRow label="Change Password" />
          <LinkRow label="Two-Factor Authentication" />
          <LinkRow label="Active Sessions" />
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4">About</h3>
          <LinkRow label="Help & Support" />
          <LinkRow label="Privacy Policy" />
          <LinkRow label="Terms of Service" />
          <div className="text-xs text-muted-foreground mt-4">Campus Connect · v2.4.0</div>
        </Card>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, desc, value, onChange }: any) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function Field({ icon: Icon, label, v }: any) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <div className="flex-1"><div className="font-semibold text-sm">{label}</div><div className="text-xs text-muted-foreground">{v}</div></div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function LinkRow({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 text-sm hover:text-primary transition-colors text-left">
      <span className="font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
