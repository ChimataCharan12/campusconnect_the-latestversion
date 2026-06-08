import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/AppShell";
import {
  MapPin, Building2, BookOpen, Coffee, FlaskConical, Users, Search, Navigation,
  Plus, Minus, Compass, Clock, ChevronRight, PlayCircle, Info, Activity,
} from "lucide-react";

export const Route = createFileRoute("/student/navigation")({ component: Page });

const quickPlaces = [
  { name: "Academic Blocks", sub: "3 Blocks", icon: Building2, color: "emerald" },
  { name: "Labs", sub: "8 Labs", icon: FlaskConical, color: "violet" },
  { name: "Departments", sub: "12 Departments", icon: Users, color: "blue" },
  { name: "Library", sub: "Central Library", icon: BookOpen, color: "violet" },
  { name: "Canteen", sub: "Main Canteen", icon: Coffee, color: "amber" },
  { name: "Sports Complex", sub: "Indoor & Outdoor", icon: Activity, color: "emerald" },
];

const pins = [
  { x: "20%", y: "32%", label: "Hostel Block", c: "rose", icon: Building2 },
  { x: "42%", y: "30%", label: "Canteen", c: "amber", icon: Coffee },
  { x: "60%", y: "26%", label: "Library", c: "violet", icon: BookOpen },
  { x: "82%", y: "30%", label: "Block A", c: "emerald", icon: Building2 },
  { x: "32%", y: "44%", label: "Admin Block", c: "blue", icon: Building2 },
  { x: "82%", y: "44%", label: "Block B", c: "emerald", icon: Building2 },
  { x: "30%", y: "62%", label: "Auditorium", c: "violet", icon: Users },
  { x: "62%", y: "55%", label: "Computer Labs", c: "blue", icon: FlaskConical },
  { x: "62%", y: "70%", label: "Science Labs", c: "violet", icon: FlaskConical },
  { x: "45%", y: "82%", label: "Main Gate", c: "rose", icon: MapPin },
  { x: "20%", y: "82%", label: "Sports Complex", c: "emerald", icon: Activity },
  { x: "72%", y: "82%", label: "Parking Area", c: "blue", icon: MapPin },
];

const pinColors: Record<string, string> = {
  rose: "bg-rose-500", amber: "bg-amber-500", violet: "bg-primary",
  emerald: "bg-emerald-500", blue: "bg-blue-500",
};

const quickColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-600",
  violet: "bg-primary/15 text-primary",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
};

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Campus Navigation" subtitle="Find and navigate to any location within the campus." />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Map */}
          <Card className="overflow-hidden p-3">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[linear-gradient(135deg,oklch(0.94_0.04_140),oklch(0.96_0.02_180),oklch(0.95_0.03_220))]">
              {/* Streets layer */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 500">
                <path d="M0,420 L800,420" stroke="white" strokeWidth="14" />
                <path d="M400,0 L400,500" stroke="white" strokeWidth="10" />
                <path d="M0,200 L800,200" stroke="white" strokeWidth="8" />
                <circle cx="400" cy="320" r="55" fill="none" stroke="white" strokeWidth="10" />
                <path d="M180,80 L180,420" stroke="white" strokeWidth="6" />
                <path d="M640,80 L640,420" stroke="white" strokeWidth="6" />
              </svg>

              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 500">
                <path d="M360,410 Q380,360 400,320 Q420,260 480,200 Q500,180 480,130" fill="none" stroke="oklch(0.55 0.21 250)" strokeWidth="4" strokeDasharray="0" strokeLinecap="round" />
              </svg>

              {/* Map/Satellite toggle */}
              <div className="absolute top-3 left-3 inline-flex rounded-lg bg-card shadow-soft p-0.5 border border-border">
                <button className="px-3 py-1.5 rounded-md gradient-primary text-white text-xs font-semibold">Map</button>
                <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-foreground/70">Satellite</button>
              </div>
              {/* Compass */}
              <div className="absolute top-3 right-3 w-14 h-14 rounded-full bg-card shadow-soft border border-border flex items-center justify-center">
                <Compass className="w-7 h-7 text-primary" />
              </div>
              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col rounded-lg bg-card shadow-soft border border-border overflow-hidden">
                <button className="w-9 h-9 flex items-center justify-center hover:bg-muted"><Plus className="w-4 h-4" /></button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-muted border-t border-border"><Minus className="w-4 h-4" /></button>
              </div>

              {/* Pins */}
              {pins.map(p => (
                <div key={p.label} style={{ left: p.x, top: p.y }} className="absolute -translate-x-1/2 -translate-y-1/2 group">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${pinColors[p.c]} text-white text-[10px] sm:text-xs font-semibold shadow-lg whitespace-nowrap`}>
                    <p.icon className="w-3 h-3" /> {p.label}
                  </div>
                </div>
              ))}

              {/* Bottom right google credit */}
              <div className="absolute bottom-2 left-3 text-[10px] text-muted-foreground/70 font-medium select-none">Google</div>
            </div>
          </Card>

          {/* Directions */}
          <Card className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Directions</h3>
                <div className="flex items-center gap-2 text-base font-semibold">
                  <span>Main Gate</span>
                  <span className="text-muted-foreground">→</span>
                  <span>Library</span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span><strong className="text-foreground">5 min</strong> (400 m)</span></div>
                  <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-primary" /> Via Central Pathway</div>
                </div>
                <button className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-elegant">
                  <PlayCircle className="w-4 h-4" /> Start Navigation
                </button>
              </div>
              <div>
                <h3 className="font-bold mb-3">Step by Step</h3>
                <ol className="space-y-2.5 text-sm">
                  {[
                    "Start at Main Gate",
                    "Head straight on Central Pathway for 150 m",
                    "Turn right towards Academic Block",
                    "Continue straight for 200 m",
                    "Library is on your left",
                  ].map((s, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>

          {/* Note */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <span>You can access Campus Navigation from anywhere in the app. No login required!</span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Quick Places</h3>
            <div className="space-y-1">
              {quickPlaces.map(p => (
                <button key={p.name} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quickColors[p.color]}`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary">
              View All Places <ChevronRight className="w-4 h-4" />
            </button>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">I'm Looking For</h3>
            <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-muted/40">
              <input placeholder="Search places…" className="flex-1 bg-transparent outline-none text-sm" />
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-5 relative overflow-hidden">
            <h3 className="font-bold">Need Help Finding?</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Use navigation to easily find any location in the campus.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary text-primary text-sm font-semibold">
              <PlayCircle className="w-4 h-4" /> How to Use
            </button>
            <div className="absolute right-4 bottom-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
