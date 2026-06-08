import { useEffect, useRef, useState } from "react";
import {
  Send, Paperclip, Bot, Sparkles, CheckCheck, Mic, MicOff,
  Volume2, VolumeX, RotateCcw, Square, Copy, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

export interface ChatPrompt { icon?: any; label: string }
export interface ChatMsg { from: "user" | "bot"; text: string; time: string }

interface Props {
  title: string;
  subtitle: string;
  placeholder?: string;
  welcome: string;
  prompts: ChatPrompt[];
  /** Optional async reply generator. Defaults to a friendly mock. */
  reply?: (userText: string) => Promise<string> | string;
}

// Web Speech API helpers (typed loosely)
const SR = (typeof window !== "undefined" && (window as any).SpeechRecognition) || (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);
const ttsAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

export function PremiumChatbot({ title, subtitle, placeholder, welcome, prompts, reply }: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "bot", text: welcome, time: now() },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const [speakingNow, setSpeakingNow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => () => {
    if (ttsAvailable) window.speechSynthesis.cancel();
    if (recogRef.current) try { recogRef.current.stop(); } catch {}
  }, []);

  function speak(text: string) {
    if (!ttsAvailable || !speakOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = "en-US";
    u.onstart = () => setSpeakingNow(true);
    u.onend = () => setSpeakingNow(false);
    u.onerror = () => setSpeakingNow(false);
    window.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    if (!ttsAvailable) return;
    window.speechSynthesis.cancel();
    setSpeakingNow(false);
  }

  function toggleMic() {
    if (!SR) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const r = new SR();
    recogRef.current = r;
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    let final = "";
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const s = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += s;
        else interim += s;
      }
      setText((final + interim).trim());
    };
    r.onerror = () => { setListening(false); toast.error("Could not capture audio"); };
    r.onend = () => {
      setListening(false);
      const finalText = (final || "").trim();
      if (finalText) {
        setText("");
        void send(finalText);
      }
    };
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  }

  async function send(override?: string) {
    const t = (override ?? text).trim();
    if (!t) return;
    setMsgs(m => [...m, { from: "user", text: t, time: now() }]);
    setText("");
    setTyping(true);
    try {
      const response = await (reply ? reply(t) : defaultReply(t));
      setTyping(false);
      setMsgs(m => [...m, { from: "bot", text: response, time: now() }]);
      speak(response);
    } catch {
      setTyping(false);
      toast.error("Assistant is unavailable. Try again.");
    }
  }

  function replayLast() {
    const last = [...msgs].reverse().find(m => m.from === "bot");
    if (last) {
      if (!speakOn) setSpeakOn(true);
      // Use a slight defer so state flips first
      setTimeout(() => {
        if (!ttsAvailable) { toast.error("Text-to-speech not supported"); return; }
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(last.text);
        u.onstart = () => setSpeakingNow(true);
        u.onend = () => setSpeakingNow(false);
        window.speechSynthesis.speak(u);
      }, 0);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-3xl border border-border bg-card shadow-premium overflow-hidden relative">
      {/* Reduced ambient glows — kept subtle so they don't bleed into chat area */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[oklch(0.68_0.21_45_/_0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[oklch(0.52_0.22_285_/_0.10)] blur-3xl" />

      {/* Premium gradient header (purple → orange neon) */}
      <div className="relative px-6 sm:px-10 py-6 border-b border-white/10 overflow-hidden bg-gradient-to-br from-[oklch(0.48_0.22_285)] via-[oklch(0.55_0.22_310)] to-[oklch(0.68_0.21_45)] text-white">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-orange-400/15 blur-2xl" />
        <div className="absolute right-24 bottom-0 w-32 h-32 rounded-full bg-fuchsia-500/15 blur-2xl" />
        <div className="absolute left-1/3 -top-6 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center ring-2 ring-white/40 shadow-[0_0_18px_-6px_rgba(251,146,60,0.35)]">
            <Bot className="w-7 h-7" strokeWidth={1.8} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-sm">{title}</h2>
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-fuchsia-500 text-white shadow-lg shadow-orange-500/30">AI</span>
            </div>
            <p className="text-sm text-white/90 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-200" /> {subtitle}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => { const next = !speakOn; setSpeakOn(next); if (!next) stopSpeaking(); toast.success(next ? "Voice replies on" : "Voice replies muted"); }}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center transition-all hover:scale-105 ring-1 ring-white/20"
              aria-label={speakOn ? "Mute voice" : "Enable voice"} title={speakOn ? "Mute voice" : "Enable voice"}
            >
              {speakOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {speakingNow && (
              <button onClick={stopSpeaking} className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/20" aria-label="Stop speaking" title="Stop speaking">
                <Square className="w-4 h-4" />
              </button>
            )}
            <button onClick={replayLast} className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/20 transition-all hover:scale-105" aria-label="Replay last response" title="Replay last response">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 bg-card cc-scroll relative">
        <div className="text-center text-xs text-muted-foreground">
          <span className="bg-muted px-4 py-1.5 rounded-full">Today</span>
        </div>

        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} gap-3 group`}>
            {m.from === "bot" && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_285)] via-fuchsia-500 to-orange-400 text-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.35)] ring-2 ring-white/60 dark:ring-white/5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className="max-w-[80%] sm:max-w-[640px]">
              <div className={`px-4 py-3 text-sm leading-relaxed shadow-soft whitespace-pre-wrap break-words transition-all ${
                m.from === "user"
                  ? "bg-gradient-to-br from-[oklch(0.52_0.21_285)] via-fuchsia-500 to-orange-500 text-white rounded-2xl rounded-tr-md shadow-[0_4px_14px_-6px_rgba(168,85,247,0.4)]"
                  : "bg-card/80 backdrop-blur text-foreground rounded-2xl rounded-tl-md border border-border/70 hover:border-primary/30"
              }`}>
                {m.text}
              </div>
              <div className={`text-[10px] text-muted-foreground mt-1.5 px-1 flex items-center gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <span>{m.time}</span>
                {m.from === "user" && <CheckCheck className="w-3 h-3 text-primary" />}
                {m.from === "bot" && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button onClick={() => { navigator.clipboard?.writeText(m.text); toast.success("Copied"); }} className="hover:text-foreground" title="Copy"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => toast.success("Thanks for the feedback")} className="hover:text-foreground" title="Helpful"><ThumbsUp className="w-3 h-3" /></button>
                    <button onClick={() => toast("Feedback noted")} className="hover:text-foreground" title="Not helpful"><ThumbsDown className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3 items-end">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_285)] via-fuchsia-500 to-orange-400 text-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(168,85,247,0.35)]"><Bot className="w-4 h-4" /></div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-card border border-border/70 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-orange-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-orange-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-orange-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 sm:px-8 py-4 space-y-3 bg-card/80 backdrop-blur-xl relative">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {prompts.map(p => (
            <button
              key={p.label}
              onClick={() => send(p.label)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 text-xs font-semibold text-primary whitespace-nowrap hover:from-primary hover:to-orange-500 hover:text-white hover:border-transparent hover:shadow-[0_4px_14px_-2px_rgba(251,146,60,0.45)] transition-all"
            >
              {p.icon && <p.icon className="w-3.5 h-3.5" />} {p.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={e => { e.preventDefault(); void send(); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all ${listening ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20" : "border-border/60 bg-muted/30 focus-within:border-transparent focus-within:bg-card focus-within:shadow-[0_0_0_2px_oklch(0.52_0.21_285_/_0.20)]"}`}
        >
          <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Attach" title="Attach"><Paperclip className="w-4 h-4" /></button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={listening ? "Listening…" : (placeholder || "Type your question here...")}
            className="flex-1 bg-transparent outline-none text-sm py-2"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${listening ? "bg-rose-500 text-white animate-pulse" : "bg-muted hover:bg-muted/70 text-foreground"}`}
            aria-label={listening ? "Stop listening" : "Start voice input"}
            title={listening ? "Stop listening" : "Start voice input"}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button type="submit" className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.52_0.21_285)] via-fuchsia-500 to-orange-500 text-white flex items-center justify-center shadow-[0_4px_14px_-6px_rgba(168,85,247,0.45)] hover:shadow-[0_6px_18px_-6px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 transition-all" aria-label="Send">
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-center text-muted-foreground">
          {speakOn ? "Voice replies on · " : ""}AI assistant · Responses may not always be accurate.
        </p>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function defaultReply(t: string): string {
  const q = t.toLowerCase();
  if (q.includes("attendance")) return "Your current overall attendance is 82%. Your lowest subject is Computer Networks at 68%.";
  if (q.includes("mark") || q.includes("grade") || q.includes("cgpa")) return "Your current CGPA is 8.24 with a class rank of 5/60. Latest semester GPA: 8.6.";
  if (q.includes("timetable") || q.includes("schedule")) return "Today: DBMS (9–10), OS Lab (10–12), Lunch, Software Engineering (1–2), Mentoring (2–3).";
  if (q.includes("assignment")) return "You have 2 pending assignments: DBMS Lab Report (due Fri) and SE Case Study (due Mon).";
  if (q.includes("fee")) return "Your fee for this semester is fully paid. Next dues: next semester (Jul 1).";
  if (q.includes("library")) return "Central Library is in Block A, Ground Floor. Hours: Mon–Sat 8:30 AM – 8:00 PM.";
  return "Got it. Here's a summary of what I found related to your query. You can also explore the External Portals for the full record.";
}
