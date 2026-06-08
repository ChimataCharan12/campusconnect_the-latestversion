import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-elegant overflow-hidden border border-border">
        <div className="gradient-hero text-white p-7 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2"><GraduationCap className="w-7 h-7" /></div>
          <div className="font-bold text-xl">Forgot Password?</div>
          <p className="text-white/85 text-sm mt-1">We'll send a reset link to your email.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Reset link sent to your email"); }} className="p-8">
          <label className="text-sm font-medium">Email Address</label>
          <div className="mt-1.5 relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {sent && <div className="mt-4 p-3 rounded-lg bg-success/10 text-success text-sm">Check your inbox for the reset link.</div>}
          <button type="submit" className="mt-5 w-full py-3 rounded-xl gradient-primary text-white font-semibold">Send Reset Link</button>
          <Link to="/login" className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
