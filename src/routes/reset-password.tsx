import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No reset token found. Please use the link from your email.");
      return;
    }

    if (pw !== pw2) {
      setError("Passwords don't match.");
      return;
    }

    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password. Please try again.");
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-elegant overflow-hidden border border-border">
        <div className="gradient-hero text-white p-7 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2"><GraduationCap className="w-7 h-7" /></div>
          <div className="font-bold text-xl">Reset Password</div>
          <p className="text-white/85 text-sm mt-1">Choose a new strong password.</p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="font-semibold text-lg">Password Reset Successfully!</div>
            <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
            <Link to="/login" className="block text-center text-sm text-primary font-semibold">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {[{ v: pw, s: setPw, l: "New Password" }, { v: pw2, s: setPw2, l: "Confirm Password" }].map((f, i) => (
              <div key={i}>
                <label className="text-sm font-medium">{f.l}</label>
                <div className="mt-1.5 relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={f.v}
                    onChange={e => f.s(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting...</>
                : "Reset Password"
              }
            </button>
            <Link to="/login" className="block text-center text-sm text-muted-foreground">Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
