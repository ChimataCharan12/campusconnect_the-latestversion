import { useState, type ReactNode } from "react";
import { downloadCSV, downloadPDF, downloadText, downloadXLSX, importTableFile, uploadFiles } from "@/lib/files";

type ActionKind = "upload" | "import" | "csv" | "xlsx" | "pdf" | "text";

interface FileActionButtonProps {
  kind: ActionKind;
  label: string;
  filename?: string;
  rows?: Array<Record<string, any>>;
  title?: string;
  body?: string;
  accept?: string;
  className?: string;
  children?: ReactNode;
}

export function FileActionButton({ kind, label, filename, rows = [], title, body, accept, className = "", children }: FileActionButtonProps) {
  const [fileName, setFileName] = useState("");
  const handleClick = async () => {
    if (kind === "upload") {
      const file = await uploadFiles(label, accept ?? ".csv,.xlsx,.pdf");
      if (file) setFileName(file.name);
      return;
    }
    if (kind === "import") {
      const result = await importTableFile(label, accept ?? ".csv,.xlsx");
      if (result?.file) setFileName(result.file.name);
      return;
    }
    if (kind === "xlsx") downloadXLSX(filename ?? "report.xlsx", rows, title ?? "Report");
    else if (kind === "pdf") downloadPDF(title ?? label, body ?? rowsToHtml(rows), filename ?? "report.pdf");
    else if (kind === "text") downloadText(filename ?? "download.txt", body ?? rowsToText(rows));
    else downloadCSV(filename ?? "export.csv", rows);
  };

  return (
    <button onClick={handleClick} className={className} type="button" title={fileName ? `Selected: ${fileName}` : label}>
      {children ?? label}{fileName && <span className="ml-1 max-w-[140px] truncate opacity-80">· {fileName}</span>}
    </button>
  );
}

export function rowsToHtml(rows: Array<Record<string, any>>) {
  if (!rows.length) return "<p>No records available.</p>";
  const cols = Object.keys(rows[0]);
  return `<table><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

export function rowsToText(rows: Array<Record<string, any>>) {
  if (!rows.length) return "No records available.";
  return rows.map((r, i) => `${i + 1}. ${Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(" | ")}`).join("\n");
}
