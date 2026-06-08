import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import { MapPin, Building2, BookOpen, Users, Search, Navigation, Plus, Minus, Compass, Clock, ChevronRight, Landmark, ClipboardCheck, Car, FileSignature, Presentation, Info } from "lucide-react";

export const Route = createFileRoute("/parent/navigation")({ component: Page });

const quickPlaces = [
  { name: "Academic Blocks", sub: "3 Blocks", icon: Building2, color: "emerald" },
  { name: "Administration Block", sub: "Main Office", icon: FileSignature, color: "blue" },
  { name: "Principal Office", sub: "Admin Block · GF", icon: Landmark, color: "amber" },
  { name: "Library", sub: "Central Library", icon: BookOpen, color: "violet" },
  { name: "Examination Cell", sub: "Admin Block · 1F", icon: ClipboardCheck, color: "rose" },
  { name: "Auditorium", sub: "Main Auditorium", icon: Users, color: "violet" },
  { name: "Seminar Halls", sub: "4 Halls", icon: Presentation, color: "emerald" },
  { name: "Parking Areas", sub: "Visitor & Staff", icon: Car, color: "blue" },
];
const pins = [
  { x: "42%", y: "30%", label: "Principal Office", c: "amber", icon: Landmark },
  { x: "60%", y: "26%", label: "Library", c: "violet", icon: BookOpen },
  { x: "82%", y: "30%", label: "Block A", c: "emerald", icon: Building2 },
  { x: "32%", y: "44%", label: "Admin Block", c: "blue", icon: FileSignature },
  { x: "30%", y: "62%", label: "Auditorium", c: "violet", icon: Users },
  { x: "62%", y: "55%", label: "Seminar Halls", c: "emerald", icon: Presentation },
  { x: "45%", y: "82%", label: "Main Gate", c: "rose", icon: MapPin },
  { x: "72%", y: "82%", label: "Visitor Parking", c: "blue", icon: Car },
];
const pinColors: Record<string, string> = { rose: "bg-rose-500", amber: "bg-amber-500", violet: "bg-primary", emerald: "bg-emerald-500", blue: "bg-blue-500" };
const quickColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  violet: "bg-primary/15 text-primary",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Campus Navigation" subtitle="Find your way around campus during visits — locate buildings, halls and facilities." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Card className="overflow-hidden p-3">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[linear-gradient(135deg,oklch(0.94_0.04_140),oklch(0.96_0.02_180),oklch(0.95_0.03_220))] dark:bg-[linear-gradient(135deg,oklch(0.28_0.04_260),oklch(0.24_0.03_250),oklch(0.22_0.04_270))]">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 500">
                <path d="M0,420 L800,420" stroke="white" strokeWidth="14" />
                <path d="M400,0 L400,500" stroke="white" strokeWidth="10" />
                <path d="M0,200 L800,200" stroke="white" strokeWidth="8" />
                <circle cx="400" cy="320" r="55" fill="none" stroke="white" strokeWidth="10" />
              </svg>
              <div className="absolute top-3 left-3 inline-flex rounded-lg bg-card shadow-soft p-0.5 border border-border">
                <button className="px-3 py-1.5 rounded-md gradient-primary text-white text-xs font-semibold">Map</button>
                <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-foreground/70">Satellite</button>
              </div>
              <div className="absolute top-3 right-3 w-14 h-14 rounded-full bg-card shadow-soft border border-border flex items-center justify-center"><Compass className="w-7 h-7 text-primary" /></div>
              <div className="absolute bottom-3 right-3 flex flex-col rounded-lg bg-card shadow-soft border border-border overflow-hidden">
                <button className="w-9 h-9 flex items-center justify-center hover:bg-muted"><Plus className="w-4 h-4" /></button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-muted border-t border-border"><Minus className="w-4 h-4" /></button>
              </div>
              {pins.map(p => (
                <div key={p.label} style={{ left: p.x, top: p.y }} className="absolute -translate-x-1/2 -translate-y-1/2 group">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${pinColors[p.c]} text-white text-[10px] sm:text-xs font-semibold shadow-lg whitespace-nowrap transition-transform group-hover:scale-110`}>
                    <p.icon className="w-3 h-3" /> {p.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold mb-3">Directions</h3>
            <div className="flex items-center gap-2 text-base font-semibold"><span>Main Gate</span><span className="text-muted-foreground">→</span><span>Principal Office</span></div>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span><strong className="text-foreground">3 min</strong> (250 m)</span></div>
              <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-primary" /> Via main corridor</div>
            </div>
          </Card>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><Info className="w-4 h-4" /></div>
            <span>Parents visiting campus can use this map to find their way around during meetings or events.</span>
          </div>
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Quick Places</h3>
            <div className="space-y-1">
              {quickPlaces.map(p => (
                <button key={p.name} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quickColors[p.color]}`}><p.icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.sub}</div></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold mb-3">I'm Looking For</h3>
            <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-muted/40">
              <input placeholder="Search rooms, halls…" className="flex-1 bg-transparent outline-none text-sm" />
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
