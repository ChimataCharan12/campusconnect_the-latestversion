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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSent(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSent(true);
      toast.success(data.message || "Reset link sent to your email");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-elegant overflow-hidden border border-border">
        <div className="gradient-hero text-white p-7 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="font-bold text-xl">Forgot Password?</div>
          <p className="text-white/85 text-sm mt-1">We'll send a reset link to your email.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <label className="text-sm font-medium">Email Address</label>
          <div className="mt-1.5 relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
          {sent && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 text-success text-sm">
              Check your inbox for the reset link.
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}

