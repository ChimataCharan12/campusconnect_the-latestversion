import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { Search, Download, FileText, FileType, Sparkles } from "lucide-react";
import { materials } from "@/lib/mock";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/materials")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const filtered = materials.filter(m => m.title.toLowerCase().includes(q.toLowerCase()) || m.subject.toLowerCase().includes(q.toLowerCase()));

  function download(m: typeof materials[number]) {
    const text = `${m.title}\n${m.subject}\n\nSample study material content. (${m.size})`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${m.title.replace(/\s+/g, "_")}.${m.type === "PDF" ? "pdf.txt" : "ppt.txt"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${m.title}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Study Materials" subtitle="Access notes, PDFs, slides and previous year papers." />
      <Card className="p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search materials..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>All Subjects</option></select>
        <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm"><option>All Types</option><option>PDF</option><option>PPT</option></select>
      </Card>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(m => {
          const isPdf = m.type === "PDF";
          return (
            <Card
              key={m.title}
              className="group relative p-5 overflow-hidden border border-border/70 bg-gradient-to-br from-card via-card to-muted/40 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_38px_-12px_oklch(0.52_0.21_285_/_0.35)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity ${isPdf ? "bg-rose-400/30" : "bg-amber-400/30"}`} />
              <div className="relative flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft ring-1 ${
                  isPdf
                    ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white ring-rose-300/40"
                    : "bg-gradient-to-br from-amber-500 to-orange-500 text-white ring-amber-300/40"
                }`}>
                  {isPdf ? <FileText className="w-5 h-5" /> : <FileType className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[15px] tracking-tight truncate">{m.title}</h3>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{m.subject}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      isPdf ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}>{m.type}</span>
                    <span className="text-[11px] text-muted-foreground">{m.size}</span>
                    <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> {m.downloads}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => download(m)}
                className="relative mt-5 w-full h-10 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.5)] hover:shadow-[0_12px_28px_-8px_oklch(0.52_0.21_285_/_0.75)] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
