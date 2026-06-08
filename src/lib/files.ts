// Real frontend file utilities: CSV/JSON/XLSX/PDF download + file picker.
import { toast } from "sonner";
import * as XLSX from "xlsx";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCSV(filename: string, rows: Array<Record<string, any>>, columns?: string[]) {
  if (!rows.length) {
    toast.error("No data to export");
    return;
  }
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
  toast.success(`Exported ${filename}`);
}

export function downloadJSON(filename: string, data: any) {
  triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
  toast.success(`Downloaded ${filename}`);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  triggerDownload(new Blob([text], { type: mime }), filename);
  toast.success(`Downloaded ${filename}`);
}

export function downloadXLSX(filename: string, rows: Array<Record<string, any>>, sheetName = "Report") {
  if (!rows.length) {
    toast.error("No data to export");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
  toast.success(`Downloaded ${filename}`);
}

/** Downloads a timetable grid as a properly-structured Excel file with a Time column and days as columns. */
export function downloadTimetableXLSX(
  filename: string,
  days: string[],
  slots: string[],
  /** grid[dayIndex][slotIndex] = subject */
  grid: string[][],
  sheetName = "Timetable",
) {
  const aoa: any[][] = [["Time", ...days]];
  slots.forEach((slot, i) => {
    aoa.push([slot, ...days.map((_, j) => grid[j]?.[i] ?? "")]);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 14 }, ...days.map(() => ({ wch: 22 }))];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
  toast.success(`Downloaded ${filename}`);
}

function stripHtml(input: string) {
  return input.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function makeSimplePdf(title: string, body: string) {
  const lines = [title, `Generated ${new Date().toLocaleString()}`, "", stripHtml(body)].join("\n").match(/.{1,88}/g) ?? [title];
  const escape = (v: string) => v.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = [`BT`, `/F1 16 Tf`, `50 780 Td`, `(${escape(lines[0] ?? title)}) Tj`, `/F1 10 Tf`];
  lines.slice(1, 48).forEach(line => content.push(`0 -16 Td`, `(${escape(line)}) Tj`));
  content.push(`ET`);
  const stream = content.join("\n");
  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
    `4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach(obj => { offsets.push(pdf.length); pdf += obj + "\n"; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(o => { pdf += `${String(o).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

/** Generates and downloads a lightweight PDF file. */
export function downloadPDF(title: string, htmlBody: string, filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report"}.pdf`) {
  const pdf = makeSimplePdf(title, htmlBody);
  triggerDownload(new Blob([pdf], { type: "application/pdf" }), filename);
  toast.success(`Downloaded ${filename}`);
}

/** Opens the OS file picker and returns the selected file(s). */
export function pickFile(opts: { accept?: string; multiple?: boolean } = {}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (opts.accept) input.accept = opts.accept;
    if (opts.multiple) input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      resolve(files);
    };
    input.click();
  });
}

export async function uploadFiles(label: string, accept = ".csv,.xlsx,.pdf,.json") {
  const files = await pickFile({ accept, multiple: false });
  if (!files.length) return null;
  const f = files[0];
  const sizeKb = (f.size / 1024).toFixed(1);
  toast.success(`${label}: "${f.name}" (${sizeKb} KB) uploaded`);
  return f;
}

export async function importTableFile(label: string, accept = ".csv,.xlsx") {
  const files = await pickFile({ accept, multiple: false });
  if (!files.length) return null;
  const file = files[0];
  const ext = file.name.split(".").pop()?.toLowerCase();
  let rows: Array<Record<string, any>> = [];
  try {
    if (ext === "xlsx" || ext === "xls") {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws);
    } else {
      const text = await file.text();
      const [header = "", ...body] = text.split(/\r?\n/).filter(Boolean);
      const cols = header.split(",").map(c => c.trim());
      rows = body.map(line => Object.fromEntries(line.split(",").map((v, i) => [cols[i] ?? `Column ${i + 1}`, v.trim()])));
    }
    toast.success(`${label}: imported ${file.name}`, { description: rows.length ? `${rows.length} rows loaded` : "File selected" });
  } catch {
    toast.success(`${label}: selected ${file.name}`);
  }
  return { file, rows };
}
