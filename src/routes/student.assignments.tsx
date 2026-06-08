import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card } from "@/components/AppShell";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, Upload, Eye, Calendar, Download, X, FileText, Info } from "lucide-react";
import { assignments } from "@/lib/mock";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/assignments")({ component: Page });

const priorityColor: Record<string, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};
const statusStyle: Record<string, string> = {
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Overdue: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

type A = (typeof assignments)[number];
type Mode = "details" | "submission";

function Page() {
  const [list, setList] = useState(assignments.map(a => ({ ...a, submittedFile: a.status === "Submitted" ? "process_scheduling_solution.pdf" : "" })));
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("details");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadIdxRef = useRef<number | null>(null);

  function openModal(i: number, m: Mode) { setOpenIdx(i); setMode(m); }

  function handleUploadClick(i: number) {
    uploadIdxRef.current = i;
    fileRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    const i = uploadIdxRef.current;
    if (!f || i == null) return;
    setList(prev => prev.map((a, idx) => idx === i ? { ...a, status: "Submitted", submittedFile: f.name } : a));
    toast.success(`Uploaded: ${f.name}`);
    e.target.value = "";
  }

  function handleDownload(a: A) {
    const text = `Assignment: ${a.title}\nSubject: ${a.subject}\nDue: ${a.due}\nPriority: ${a.priority}\n\nInstructions:\nComplete the assignment as per the rubric and submit the solution before the due date.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${a.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Assignment downloaded");
  }

  const current = openIdx != null ? list[openIdx] : null;

  return (
    <div className="space-y-6">
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg" />
      <PageHeader
        title="Assignments"
        subtitle="Track upcoming, in-progress and submitted assignments."
        action={
          <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm">
            <option>All Subjects</option>
          </select>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Assignments" value={String(list.length)} tint="violet" />
        <StatCard icon={Clock} label="Pending" value={String(list.filter(a => a.status === "Pending").length)} tint="amber" />
        <StatCard icon={CheckCircle2} label="Submitted" value={String(list.filter(a => a.status === "Submitted").length)} tint="emerald" />
        <StatCard icon={AlertTriangle} label="Overdue" value={String(list.filter(a => a.status === "Overdue").length)} tint="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {list.map((a, i) => {
          const submitted = a.status === "Submitted";
          return (
            <Card key={i} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-base">{a.title}</h3>
                  <div className="text-sm text-muted-foreground mt-0.5">{a.subject}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${priorityColor[a.priority]}`}>{a.priority}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Due: <span className="font-semibold text-foreground">{a.due}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[a.status] ?? statusStyle.Pending}`}>{a.status}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => openModal(i, "details")}
                  className="h-10 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <Info className="w-4 h-4" /> View Details
                </button>
                <button
                  onClick={() => handleDownload(a)}
                  className="h-10 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              <button
                onClick={() => submitted ? openModal(i, "submission") : handleUploadClick(i)}
                className={`mt-2 w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-all ${
                  submitted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200/70"
                    : "bg-gradient-to-r from-[oklch(0.52_0.21_285)] to-[oklch(0.46_0.22_285)] text-white shadow-[0_8px_20px_-8px_oklch(0.52_0.21_285_/_0.5)] hover:shadow-[0_10px_24px_-8px_oklch(0.52_0.21_285_/_0.7)]"
                }`}
              >
                {submitted ? <><Eye className="w-4 h-4" /> View Submission</> : <><Upload className="w-4 h-4" /> Upload Submission</>}
              </button>
            </Card>
          );
        })}
      </div>

      {current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpenIdx(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-bold text-lg">{mode === "details" ? "Assignment Details" : "Your Submission"}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{current.title}</p>
              </div>
              <button onClick={() => setOpenIdx(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {mode === "details" ? (
                <>
                  <Row k="Subject" v={current.subject} />
                  <Row k="Due Date" v={current.due} />
                  <Row k="Priority" v={current.priority.toUpperCase()} />
                  <Row k="Status" v={current.status} />
                  <div className="pt-2 text-muted-foreground leading-relaxed">
                    Complete the assignment as per the rubric. Submit a single PDF/DOC file. Late submissions incur a 10% penalty per day.
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Row k="File" v={current.submittedFile || "—"} />
                  <Row k="Submitted On" v={current.due} />
                  <Row k="Status" v="Submitted on time" />
                  <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{current.submittedFile || "submission.pdf"}</div>
                      <div className="text-xs text-muted-foreground">Click below to re-upload a revised version.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setOpenIdx(null); handleUploadClick(openIdx!); }}
                    className="w-full h-10 rounded-xl border border-primary/30 text-primary text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/5"
                  >
                    <Upload className="w-4 h-4" /> Re-upload Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
