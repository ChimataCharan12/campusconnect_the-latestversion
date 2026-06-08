import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { BookOpen, Upload, FileText, Download, Eye, FileBox } from "lucide-react";
import { downloadText, uploadFiles } from "@/lib/files";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/faculty/materials")({ component: Page });

interface Item { title: string; subject: string; type: string; size: string; downloads: number; color: string; summary: string }

const items: Item[] = [
  { title: "Data Structures - Complete Notes", subject: "Data Structures", type: "PDF", size: "4.2 MB", downloads: 234, color: "violet", summary: "Comprehensive notes covering arrays, linked lists, stacks, queues, trees, graphs, hashing and algorithm complexity." },
  { title: "DBMS Lecture Slides Week 1-6", subject: "DBMS", type: "PPT", size: "8.1 MB", downloads: 189, color: "emerald", summary: "Lecture slides covering ER modelling, relational model, SQL fundamentals and constraints." },
  { title: "Previous Year Question Papers", subject: "All Subjects", type: "PDF", size: "12 MB", downloads: 512, color: "blue", summary: "Last 5 years of end-semester question papers across CSE subjects with marking schemes." },
  { title: "Normalization Examples", subject: "DBMS", type: "PDF", size: "2.8 MB", downloads: 145, color: "emerald", summary: "Worked examples for 1NF, 2NF, 3NF and BCNF with decomposition exercises." },
  { title: "Trees & Graph Algorithms", subject: "Data Structures", type: "PDF", size: "5.6 MB", downloads: 98, color: "violet", summary: "Binary trees, BST, AVL, heap, BFS/DFS, Dijkstra and minimum spanning tree algorithms with pseudocode." },
  { title: "ML Reference Reading List", subject: "Machine Learning", type: "DOC", size: "1.2 MB", downloads: 67, color: "rose", summary: "Curated list of papers, textbooks and online courses for self-study in machine learning." },
];

function Page() {
  const [preview, setPreview] = useState<Item | null>(null);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        subtitle="Upload, organize and share materials with your students."
        action={
          <button onClick={() => void uploadFiles("Study Material", ".pdf,.ppt,.pptx,.doc,.docx,.zip")} className="h-11 px-5 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white text-sm font-bold inline-flex items-center gap-2 shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.6)]">
            <Upload className="w-4 h-4" /> Upload Material
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileBox} label="Total Files" value="42" tint="violet" />
        <StatCard icon={Download} label="Downloads This Month" value="1,245" tint="emerald" />
        <StatCard icon={BookOpen} label="Subjects Covered" value="6" tint="blue" />
        <StatCard icon={FileText} label="Storage Used" value="284 MB" tint="amber" sub="of 2 GB" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m, i) => {
          const bg: Record<string, string> = {
            violet: "from-violet-500 to-purple-600",
            emerald: "from-emerald-500 to-teal-600",
            blue: "from-sky-500 to-blue-600",
            rose: "from-rose-500 to-pink-600",
          };
          return (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg[m.color]} text-white flex items-center justify-center shadow-soft`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.subject}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-muted font-semibold">{m.type}</span>
                  <span className="text-muted-foreground">{m.size}</span>
                </div>
                <div className="text-muted-foreground">{m.downloads} downloads</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setPreview(m)} className="h-9 rounded-lg border border-border text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-muted"><Eye className="w-3.5 h-3.5" /> Preview</button>
                <button onClick={() => downloadText(`${m.title.replace(/[^\w\d]+/g, "-").toLowerCase()}.txt`, `${m.title}\n${m.subject}\n${m.type} · ${m.size}\n\n${m.summary}`)} className="h-9 rounded-lg bg-primary/10 text-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-primary/20"><Download className="w-3.5 h-3.5" /> Download</button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>{preview?.subject} · {preview?.type} · {preview?.size}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4 min-h-[180px] text-sm leading-relaxed">
              <div className="font-semibold mb-2">Summary</div>
              <p className="text-muted-foreground">{preview?.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Meta k="Downloads" v={String(preview?.downloads ?? 0)} />
              <Meta k="Format" v={preview?.type ?? "—"} />
              <Meta k="Size" v={preview?.size ?? "—"} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setPreview(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted">Close</button>
            <button onClick={() => preview && downloadText(`${preview.title.replace(/[^\w\d]+/g, "-").toLowerCase()}.txt`, `${preview.title}\n${preview.subject}\n${preview.type} · ${preview.size}\n\n${preview.summary}`)} className="h-10 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-glow-violet inline-flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className="font-bold mt-0.5">{v}</div>
    </div>
  );
}
