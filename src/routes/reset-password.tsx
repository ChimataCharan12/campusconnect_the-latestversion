import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: Page });

function Page() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    toast.success("Password reset successfully");
    navigate({ to: "/login" });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-elegant overflow-hidden border border-border">
        <div className="gradient-hero text-white p-7 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2"><GraduationCap className="w-7 h-7" /></div>
          <div className="font-bold text-xl">Reset Password</div>
          <p className="text-white/85 text-sm mt-1">Choose a new strong password.</p>
        </div>
        <form onSubmit={submit} className="p-8 space-y-4">
          {[{ v: pw, s: setPw, l: "New Password" }, { v: pw2, s: setPw2, l: "Confirm Password" }].map((f, i) => (
            <div key={i}>
              <label className="text-sm font-medium">{f.l}</label>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input type="password" required value={f.v} onChange={e => f.s(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          ))}
          <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-white font-semibold">Reset Password</button>
          <Link to="/login" className="block text-center text-sm text-muted-foreground">Back to login</Link>
        </form>
      </div>
    </div>
  );
}
