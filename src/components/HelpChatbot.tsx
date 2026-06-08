import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, MessageSquare, HelpCircle, LayoutDashboard, Settings as SettingsIcon, Mic, MicOff, Volume2, VolumeX, RotateCcw } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const suggestions = [
  { icon: LayoutDashboard, text: "How do I use my dashboard?" },
  { icon: HelpCircle, text: "How do I navigate the app?" },
  { icon: SettingsIcon, text: "Where are my settings?" },
  { icon: MessageSquare, text: "How do I send notifications?" },
];

const canned: Record<string, string> = {
  dashboard: "Your dashboard gives a real-time overview of activity. Use the cards at the top for key metrics and scroll for charts and insights.",
  navigate: "Use the left sidebar to jump between modules. The purple pill highlights your current page. Use the top search bar to find anything fast.",
  settings: "Open Settings from the sidebar. You can manage profile, appearance, notifications and security from there.",
  notification: "Go to Notification Management to create, schedule, and track notifications across the campus.",
  attendance: "You can mark attendance from the Attendance page. Use Quick Actions to mark all, or set per student.",
  marks: "The Marks page lets you record, edit and export student marks per subject and assessment.",
  upload: "Upload buttons open a real file picker. Choose a CSV, XLSX or PDF from your device.",
  export: "Export buttons download a real file (CSV / Excel / PDF) directly to your device.",
};

function reply(q: string): string {
  const t = q.toLowerCase();
  for (const k of Object.keys(canned)) if (t.includes(k)) return canned[k];
  if (t.includes("help")) return "I'm your Campus Connect Help Assistant. Ask me anything about navigation, dashboards, settings, or any feature.";
  return "Got it! I'm here to help you use Campus Connect. Try asking about dashboards, attendance, marks, uploads, exports or any module.";
}

// ----- Web Speech wrappers (graceful no-op if unsupported) -----
function getRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.continuous = false;
  r.interimResults = false;
  r.lang = "en-US";
  return r;
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  } catch {}
}

function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}

export function HelpChatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm your Campus Connect Help Assistant. How can I help you today? Tap the mic to talk to me." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const supportsSTT = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const supportsTTS = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { if (!open) { stopSpeaking(); setSpeaking(false); } }, [open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages(m => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      const r = reply(t);
      setMessages(m => [...m, { role: "bot", text: r }]);
      if (!muted && supportsTTS) {
        setSpeaking(true);
        speak(r, () => setSpeaking(false));
      }
    }, 450);
  };

  const toggleMic = () => {
    if (!supportsSTT) return;
    if (listening) { recRef.current?.stop?.(); setListening(false); return; }
    const r = getRecognition();
    if (!r) return;
    recRef.current = r;
    r.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) send(transcript);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    try { r.start(); setListening(true); } catch { setListening(false); }
  };

  const replayLast = () => {
    const last = [...messages].reverse().find(m => m.role === "bot");
    if (!last || !supportsTTS) return;
    setSpeaking(true);
    speak(last.text, () => setSpeaking(false));
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed right-0 top-0 h-screen w-full sm:w-[440px] bg-card z-[61] shadow-2xl border-l border-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Premium header */}
        <div className="relative overflow-hidden p-5 text-white"
             style={{ background: "radial-gradient(120% 100% at 100% 0%, oklch(0.70 0.20 320 / 0.55), transparent 60%), radial-gradient(100% 120% at 0% 100%, oklch(0.65 0.18 230 / 0.45), transparent 60%), linear-gradient(135deg, oklch(0.50 0.22 285), oklch(0.38 0.22 290) 55%, oklch(0.42 0.20 310))" }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25 shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[16px] flex items-center gap-1.5">AI Help Assistant <Sparkles className="w-3.5 h-3.5" /></div>
              <div className="text-[11.5px] text-white/85 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {listening ? "Listening…" : speaking ? "Speaking…" : "Online · Voice ready"}
              </div>
            </div>
            <button onClick={() => setMuted(m => !m)} title={muted ? "Unmute voice" : "Mute voice"} className="w-9 h-9 rounded-xl hover:bg-white/15 flex items-center justify-center" aria-label="Mute">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-white/15 flex items-center justify-center" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          {speaking && (
            <button onClick={() => { stopSpeaking(); setSpeaking(false); }} className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" /> Stop speaking
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-muted/30 to-background">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[oklch(0.42_0.22_285)] text-white flex items-center justify-center mr-2 shrink-0 shadow">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug shadow-sm ${
                m.role === "user" ? "bubble-user rounded-br-md" : "bubble-bot rounded-bl-md"
              }`}>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick suggestions</div>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s.text)} className="text-left p-2.5 rounded-xl chip-suggestion flex items-center gap-2">
                  <s.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11.5px] font-medium text-foreground/80 leading-tight">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input + voice toolbar */}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t border-border bg-card">
          <div className="flex items-center gap-2 px-2.5 h-12 rounded-full border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
            <button
              type="button"
              onClick={toggleMic}
              disabled={!supportsSTT}
              title={supportsSTT ? (listening ? "Stop listening" : "Speak") : "Voice not supported in this browser"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md animate-pulse"
                  : supportsSTT
                    ? "bg-muted hover:bg-primary/10 text-foreground/70 hover:text-primary"
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              autoFocus={open}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask me anything, or tap the mic"}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button type="button" onClick={replayLast} disabled={!supportsTTS} title="Replay last response" className="w-9 h-9 rounded-full bg-muted hover:bg-primary/10 text-foreground/70 hover:text-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button type="submit" className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.52_0.21_285)] to-[oklch(0.42_0.22_285)] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
