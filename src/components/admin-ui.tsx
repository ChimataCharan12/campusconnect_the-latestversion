import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Tint = "violet" | "emerald" | "amber" | "rose" | "blue" | "fuchsia" | "orange" | "cyan" | "indigo";

const tintMap: Record<Tint, { grad: string; label: string; ring: string; soft: string }> = {
  violet:   { grad: "from-violet-500 to-purple-600",      label: "text-violet-600 dark:text-violet-300",   ring: "shadow-[0_10px_24px_-10px_rgba(139,92,246,0.55)]",  soft: "bg-violet-50/60 dark:bg-violet-500/10" },
  emerald:  { grad: "from-emerald-500 to-teal-600",       label: "text-emerald-600 dark:text-emerald-300", ring: "shadow-[0_10px_24px_-10px_rgba(16,185,129,0.55)]",  soft: "bg-emerald-50/60 dark:bg-emerald-500/10" },
  amber:    { grad: "from-amber-400 to-orange-500",       label: "text-amber-600 dark:text-amber-300",     ring: "shadow-[0_10px_24px_-10px_rgba(245,158,11,0.55)]",  soft: "bg-amber-50/60 dark:bg-amber-500/10" },
  rose:     { grad: "from-rose-500 to-pink-600",          label: "text-rose-600 dark:text-rose-300",       ring: "shadow-[0_10px_24px_-10px_rgba(244,63,94,0.55)]",   soft: "bg-rose-50/60 dark:bg-rose-500/10" },
  blue:     { grad: "from-sky-500 to-blue-600",           label: "text-sky-600 dark:text-sky-300",         ring: "shadow-[0_10px_24px_-10px_rgba(59,130,246,0.55)]",  soft: "bg-sky-50/60 dark:bg-sky-500/10" },
  fuchsia:  { grad: "from-fuchsia-500 to-pink-600",       label: "text-fuchsia-600 dark:text-fuchsia-300", ring: "shadow-[0_10px_24px_-10px_rgba(217,70,239,0.55)]",  soft: "bg-fuchsia-50/60 dark:bg-fuchsia-500/10" },
  orange:   { grad: "from-orange-500 to-red-500",         label: "text-orange-600 dark:text-orange-300",   ring: "shadow-[0_10px_24px_-10px_rgba(249,115,22,0.55)]",  soft: "bg-orange-50/60 dark:bg-orange-500/10" },
  cyan:     { grad: "from-cyan-500 to-sky-600",           label: "text-cyan-600 dark:text-cyan-300",       ring: "shadow-[0_10px_24px_-10px_rgba(6,182,212,0.55)]",   soft: "bg-cyan-50/60 dark:bg-cyan-500/10" },
  indigo:   { grad: "from-indigo-500 to-violet-600",      label: "text-indigo-600 dark:text-indigo-300",   ring: "shadow-[0_10px_24px_-10px_rgba(99,102,241,0.55)]",  soft: "bg-indigo-50/60 dark:bg-indigo-500/10" },
};

export function MetricCard({
  icon: Icon, label, value, tint = "violet", trend, trendDir = "up", footer,
}: {
  icon: any; label: string; value: ReactNode; tint?: Tint;
  trend?: string; trendDir?: "up" | "down" | "flat"; footer?: ReactNode;
}) {
  const t = tintMap[tint];
  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus;
  const trendColor = trendDir === "up" ? "text-emerald-600 dark:text-emerald-400"
    : trendDir === "down" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground";
  return (
    <div className="group relative overflow-hidden rounded-2xl p-5 bg-card border border-border/70 shadow-soft hover:shadow-[0_14px_32px_-14px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5">
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${t.grad}`} aria-hidden />
      <div className="relative flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.grad} text-white flex items-center justify-center ${t.ring} shrink-0`}>
          <Icon className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[12px] font-semibold uppercase tracking-wide ${t.label}`}>{label}</div>
          <div className="text-[26px] leading-tight font-extrabold text-foreground mt-0.5 tracking-tight">{value}</div>
          {trend && (
            <div className={`text-[11.5px] font-semibold mt-1 inline-flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" /> {trend}
            </div>
          )}
        </div>
      </div>
      {footer && <div className="relative mt-3">{footer}</div>}
    </div>
  );
}

export function SectionCard({
  title, subtitle, action, children, className = "", padding = "p-6",
}: {
  title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; padding?: string;
}) {
  return (
    <div className={`bg-card rounded-2xl border border-border/70 shadow-soft ${className}`}>
      {(title || action) && (
        <div className={`flex flex-wrap items-start justify-between gap-3 ${padding} pb-3`}>
          <div>
            {title && <h3 className="text-[15px] font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={`${title ? `${padding} pt-2` : padding}`}>{children}</div>
    </div>
  );
}

export function Donut({
  data, size = 180, thickness = 22, center,
}: {
  data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode;
}) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-muted/40" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const seg = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />;
          offset += len;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {center}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; value: string; color: string }[] }) {
  return (
    <ul className="space-y-2 text-[12.5px]">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
          <span className="flex-1 text-foreground/80">{it.label}</span>
          <span className="font-semibold text-foreground">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ tone, children }: { tone: "success" | "warning" | "danger" | "info" | "muted"; children: ReactNode }) {
  const map = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    danger:  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    info:    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    muted:   "bg-muted text-muted-foreground",
  } as const;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold ${map[tone]}`}>{children}</span>;
}

import { toast as _toast } from "sonner";
import { downloadCSV, downloadPDF, importTableFile, uploadFiles } from "@/lib/files";

function defaultAction(label: string) {
  const normalized = label.toLowerCase();
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "campus-connect";
  const sampleRows = [{ action: label, status: "Completed", generatedAt: new Date().toLocaleString() }];
  if (normalized.includes("import")) { void importTableFile(label, ".csv,.xlsx"); return; }
  if (normalized.includes("upload") || normalized.includes("bulk")) { void uploadFiles(label, ".csv,.xlsx,.pdf"); return; }
  if (normalized.includes("export") || normalized.includes("list")) { downloadCSV(`${slug}.csv`, sampleRows); return; }
  if (normalized.includes("report") || normalized.includes("download")) { downloadPDF(label, `<p>${label} generated from Campus Connect.</p>`, `${slug}.pdf`); return; }
  _toast(label, { description: "Action performed" });
}

export function QuickActionTile({ icon: Icon, label, tint = "violet", onClick }: { icon: any; label: string; tint?: Tint; onClick?: () => void }) {
  const t = tintMap[tint];
  return (
    <button onClick={onClick ?? (() => defaultAction(label))} className={`group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 ${t.soft} hover:border-transparent hover:shadow-md transition-all`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.grad} text-white flex items-center justify-center ${t.ring}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[11.5px] font-semibold text-foreground/80 text-center leading-tight">{label}</div>
    </button>
  );
}

export function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/70 shadow-soft p-4 flex flex-wrap items-center gap-3">
      {children}
    </div>
  );
}

export function PrimaryButton({ icon: Icon, children, onClick }: { icon?: any; children: ReactNode; onClick?: () => void }) {
  const label = typeof children === "string" ? children : "Action";
  return (
    <button onClick={onClick ?? (() => defaultAction(label))} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-[13px] font-bold shadow-[0_8px_20px_-8px_oklch(0.46_0.22_285_/_0.7)] hover:shadow-[0_10px_24px_-8px_oklch(0.46_0.22_285_/_0.85)] transition-shadow">
      {Icon && <Icon className="w-4 h-4" />} {children}
    </button>
  );
}

export function GhostButton({ icon: Icon, children, onClick }: { icon?: any; children: ReactNode; onClick?: () => void }) {
  const label = typeof children === "string" ? children : "Action";
  return (
    <button onClick={onClick ?? (() => defaultAction(label))} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-card border border-border text-foreground text-[13px] font-semibold hover:bg-muted/60 transition-colors">
      {Icon && <Icon className="w-4 h-4" />} {children}
    </button>
  );
}
