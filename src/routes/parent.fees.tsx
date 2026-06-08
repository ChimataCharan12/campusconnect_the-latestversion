import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/AppShell";
import { DollarSign, CheckCircle2, Clock, Download, CreditCard, Receipt } from "lucide-react";
import { feeHistory } from "@/lib/mock";
import { downloadPDF } from "@/lib/files";
import { toast } from "sonner";

export const Route = createFileRoute("/parent/fees")({ component: Page });

function Page() {
  const paid = feeHistory.filter(f => f.status === "Paid").reduce((s, f) => s + f.amount, 0);
  const pending = feeHistory.filter(f => f.status === "Pending").reduce((s, f) => s + f.amount, 0);
  const payNow = () => toast.success("Redirecting to payment gateway…", { description: `Amount: ₹${pending.toLocaleString("en-IN")}` });
  const downloadReceipt = (f: any) => downloadPDF(`Receipt ${f.receipt}`, `Receipt No.: ${f.receipt}\nDate: ${f.date}\nAmount: ₹${f.amount.toLocaleString("en-IN")}\nStatus: ${f.status}`, `${f.receipt}.pdf`);
  return (
    <div className="space-y-6">
      <PageHeader title="Fee Management" subtitle="View fee status, payment history and download receipts."
        action={<button onClick={payNow} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-elegant hover:opacity-95 transition-opacity"><CreditCard className="w-4 h-4" /> Pay Now</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Fees (Year)" value={`₹${(paid + pending).toLocaleString("en-IN")}`} tint="violet" />
        <StatCard icon={CheckCircle2} label="Paid" value={`₹${paid.toLocaleString("en-IN")}`} tint="emerald" sub="3 receipts" />
        <StatCard icon={Clock} label="Pending" value={`₹${pending.toLocaleString("en-IN")}`} tint="amber" sub="Due 15 Jul 2025" />
        <StatCard icon={Receipt} label="Next Due Date" value="15 Jul" tint="blue" sub="2025" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-bold text-lg mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground text-left text-[11px] uppercase tracking-wide bg-muted/40">
                <th className="py-2.5 pl-3 rounded-l-lg">Receipt No.</th><th>Date</th><th>Amount</th><th>Status</th><th className="rounded-r-lg">Action</th>
              </tr></thead>
              <tbody>
                {feeHistory.map((f, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 pl-3 font-mono text-xs">{f.receipt}</td>
                    <td>{f.date}</td>
                    <td className="font-semibold">₹{f.amount.toLocaleString("en-IN")}</td>
                    <td><span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${f.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>{f.status}</span></td>
                    <td>{f.status === "Paid" ? <button onClick={() => downloadReceipt(f)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><Download className="w-3.5 h-3.5" /> Receipt</button> : <button onClick={payNow} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-95">Pay Now</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.42_0.22_285)] text-white">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider opacity-80">Amount Due</div>
              <div className="text-4xl font-extrabold mt-1">₹{pending.toLocaleString("en-IN")}</div>
              <div className="text-xs opacity-80 mt-1">Due on 15 Jul 2025</div>
              <button onClick={payNow} className="mt-4 w-full px-4 py-2.5 rounded-xl bg-white text-primary text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"><CreditCard className="w-4 h-4" /> Pay Now</button>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold mb-3">Fee Structure</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex justify-between"><span>Tuition Fee</span><span className="font-semibold text-foreground">₹40,000</span></li>
              <li className="flex justify-between"><span>Library Fee</span><span className="font-semibold text-foreground">₹2,500</span></li>
              <li className="flex justify-between"><span>Lab Fee</span><span className="font-semibold text-foreground">₹2,500</span></li>
              <li className="flex justify-between"><span>Exam Fee</span><span className="font-semibold text-foreground">₹2,500</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
