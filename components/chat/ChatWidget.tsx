"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiXMark, HiPaperAirplane } from "react-icons/hi2";
import { FiSquare, FiVolume2, FiVolumeX, FiType, FiRadio } from "react-icons/fi";
import MicGlyph from "./MicGlyph";
import AcousticOrb, { Waveform, type VoiceState } from "./AcousticOrb";
import { useSpeechInput, useSpeechOutput } from "./useVoice";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Mode = "voice" | "text";

const SUGGESTIONS = [
  "What are Jai's top skills?",
  "Summarize Jai's experience",
  "What projects has Jai built?",
  "Is Jai available for hire?",
];

/** Spoken prompts read better than the written ones — shorter, more natural. */
const VOICE_PROMPTS = [
  "What has Jai built?",
  "Tell me about his voice AI work",
  "Is he available for hire?",
];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("voice");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const speech = useSpeechOutput(voiceOut);
  const sendRef = useRef<(t: string) => void>(() => {});
  const mic = useSpeechInput(useCallback((text: string) => sendRef.current(text), []));

  /*
   * Barge-in: talking over the assistant stops it, the way a real conversation
   * works. Without this the reply keeps playing while you ask the next thing.
   */
  useEffect(() => {
    if (mic.listening) speech.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic.listening]);

  useEffect(() => {
    const openHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string; mode?: Mode }>).detail;
      const next: Mode = detail?.mode ?? "voice";
      setMode(next);
      setOpen(true);

      const msg = detail?.message?.trim();
      if (msg) {
        setTimeout(() => sendRef.current(msg), 350);
        return;
      }
      // Opening the voice UI means you intend to talk — start listening rather
      // than making the user tap a second time.
      if (next === "voice" && mic.supported) {
        setTimeout(() => mic.start(), 420);
      }
    };
    window.addEventListener("open-chat", openHandler);
    return () => window.removeEventListener("open-chat", openHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic.supported]);

  useEffect(() => {
    if (open && mode === "text") setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, mode]);

  // Closing must never leave audio playing or the mic hot.
  useEffect(() => {
    if (!open) {
      speech.cancel();
      if (mic.listening) mic.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        let msg = "Sorry, something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        setMessages((m) => [...m, { role: "assistant", content: msg }]);
        setLoading(false);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      speech.reset();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
        // Speak completed sentences as they arrive — first audio lands about a
        // sentence in rather than after the whole reply.
        speech.push(chunk);
      }
      speech.flush();
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I couldn't reach the server. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  sendRef.current = send;

  const voiceState: VoiceState = mic.listening
    ? "listening"
    : loading
      ? "thinking"
      : speech.speaking
        ? "speaking"
        : "idle";

  const statusText =
    voiceState === "listening"
      ? "listening — pause when you're done"
      : voiceState === "thinking"
        ? "thinking…"
        : voiceState === "speaking"
          ? "speaking — tap the mic to interrupt"
          : mic.supported
            ? "tap to talk"
            : "voice isn't supported in this browser";

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <>
      {/* ── Launcher: a mic, not a chat bubble ──────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => {
              setMode("voice");
              setOpen(true);
              if (mic.supported) setTimeout(() => mic.start(), 420);
            }}
            className="group fixed bottom-6 right-6 z-50 flex items-center gap-3"
            aria-label="Talk to Jai's AI assistant"
          >
            {/* Label reveals on hover so the resting state stays a clean orb. */}
            <span className="pointer-events-none hidden translate-x-2 rounded-lg border border-line bg-surface/90 px-3 py-1.5 font-mono text-xs text-ink opacity-0 shadow-e2 backdrop-blur transition-all duration-300 ease-out-quint group-hover:translate-x-0 group-hover:opacity-100 sm:block">
              talk to my AI
            </span>
            <AcousticOrb state="idle" size={58}>
              <MicGlyph size={24} />
            </AcousticOrb>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className={`glass-strong fixed bottom-6 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-xl shadow-e3 ${
              mode === "text"
                ? "h-[min(600px,calc(100vh-3rem))]"
                : "h-[min(520px,calc(100vh-3rem))]"
            }`}
          >
            {/* Header */}
            <div className="term-bar justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-3.5 w-1 rounded-sm bg-accent shadow-[0_0_10px_rgba(240,180,41,0.7)]"
                />
                <span className="font-mono text-xs text-muted">
                  jai-assistant{" "}
                  <span className="text-accent-dim">
                    — {mode === "voice" ? "voice" : "zsh"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMode(mode === "voice" ? "text" : "voice");
                    if (mic.listening) mic.stop();
                  }}
                  title={mode === "voice" ? "Switch to typing" : "Switch to voice"}
                  aria-label={mode === "voice" ? "Switch to typing" : "Switch to voice"}
                  className="rounded p-1.5 text-faint transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {mode === "voice" ? (
                    <FiType className="text-base" />
                  ) : (
                    <FiRadio className="text-base" />
                  )}
                </button>
                {speech.supported && (
                  <button
                    onClick={() => {
                      if (voiceOut) speech.cancel();
                      setVoiceOut(!voiceOut);
                    }}
                    aria-pressed={voiceOut}
                    title={voiceOut ? "Voice replies on" : "Voice replies off"}
                    aria-label={
                      voiceOut ? "Turn voice replies off" : "Turn voice replies on"
                    }
                    className={`rounded p-1.5 transition-colors ${
                      voiceOut
                        ? "text-accent hover:bg-accent/10"
                        : "text-faint hover:bg-white/5 hover:text-ink"
                    }`}
                  >
                    {voiceOut ? (
                      <FiVolume2 className="text-base" />
                    ) : (
                      <FiVolumeX className="text-base" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-1.5 text-faint transition-colors hover:bg-white/5 hover:text-ink"
                  aria-label="Close assistant"
                >
                  <HiXMark className="text-lg" />
                </button>
              </div>
            </div>

            {mode === "voice" ? (
              /* ── Voice mode ──────────────────────────────────── */
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex flex-col items-center px-6 pb-4 pt-8">
                  <button
                    onClick={() => {
                      if (speech.speaking) speech.cancel();
                      mic.toggle();
                    }}
                    disabled={!mic.supported || loading}
                    aria-pressed={mic.listening}
                    aria-label={mic.listening ? "Stop listening" : "Start listening"}
                    className="transition-transform duration-200 ease-out-quint hover:scale-[1.03] disabled:opacity-50"
                  >
                    <AcousticOrb state={voiceState} level={mic.level} size={104}>
                      {mic.listening ? (
                        <Waveform level={mic.level} className="text-primary" />
                      ) : voiceState === "speaking" ? (
                        <FiVolume2 className="text-[34px]" />
                      ) : voiceState === "thinking" ? (
                        <span className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
                        </span>
                      ) : (
                        <MicGlyph size={40} />
                      )}
                    </AcousticOrb>
                  </button>

                  <p className="mt-6 text-center font-mono text-xs text-faint">
                    {mic.error ? (
                      <span className="text-amber">{mic.error}</span>
                    ) : (
                      statusText
                    )}
                  </p>

                  {/* Live partial transcript */}
                  {mic.listening && mic.interim && (
                    <p className="mt-3 max-w-full text-center text-[15px] italic leading-relaxed text-muted">
                      “{mic.interim}”
                    </p>
                  )}
                </div>

                {/* Latest exchange, so voice mode is still readable */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {VOICE_PROMPTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-md border border-line bg-surface-2/60 px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lastUser && (
                        <p className="text-right font-mono text-xs text-accent">
                          {lastUser.content}
                        </p>
                      )}
                      {lastAssistant && (
                        <p className="whitespace-pre-wrap rounded-md rounded-tl-sm border border-line bg-surface-2/60 px-4 py-3 text-sm leading-relaxed text-ink/90">
                          {lastAssistant.content || "…"}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-line bg-surface-2/40 px-4 py-2.5">
                  <button
                    onClick={() => setMode("text")}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-faint transition-colors hover:text-accent"
                  >
                    <FiType /> type instead
                  </button>
                  {speech.speaking && (
                    <button
                      onClick={speech.cancel}
                      className="inline-flex items-center gap-1.5 rounded border border-accent/30 px-2 py-0.5 font-mono text-[10px] text-accent transition-colors hover:bg-accent/10"
                    >
                      <FiSquare className="text-[8px]" /> stop
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ── Text mode ───────────────────────────────────── */
              <>
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                  {messages.length === 0 && (
                    <div className="space-y-4">
                      <div className="rounded-md rounded-tl-sm border border-line bg-surface-2/60 px-4 py-3 font-mono text-sm text-ink/85">
                        <span className="text-accent-dim">$</span> ask.jai
                        <br />
                        <span className="text-muted">
                          Hi — I&apos;m Jai&apos;s AI assistant, grounded in his real
                          portfolio. Ask about his skills, experience, or projects.
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="rounded-md border border-line bg-surface-2/60 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-br-sm bg-accent font-mono text-primary"
                            : "rounded-tl-sm border border-line bg-surface-2/60 text-ink/90"
                        }`}
                      >
                        {m.content || (
                          <span className="inline-flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="border-t border-line bg-surface-2/50 p-3"
                >
                  <div
                    className={`flex items-center gap-2 rounded-md border bg-surface px-3 py-1.5 transition-colors ${
                      mic.listening
                        ? "border-accent/60"
                        : "border-line focus-within:border-accent/50"
                    }`}
                  >
                    <span className="font-mono text-sm text-accent-dim">$</span>
                    <input
                      ref={inputRef}
                      value={mic.listening && mic.interim ? mic.interim : input}
                      onChange={(e) => setInput(e.target.value)}
                      readOnly={mic.listening}
                      placeholder={mic.listening ? "listening…" : "ask about Jai…"}
                      className={`flex-1 bg-transparent py-2 font-mono text-sm placeholder:text-faint focus:outline-none ${
                        mic.listening ? "italic text-muted" : "text-ink"
                      }`}
                    />
                    {mic.supported && (
                      <button
                        type="button"
                        onClick={() => {
                          if (speech.speaking) speech.cancel();
                          mic.toggle();
                        }}
                        disabled={loading}
                        aria-pressed={mic.listening}
                        aria-label={mic.listening ? "Stop listening" : "Ask by voice"}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-all duration-200 disabled:opacity-40 ${
                          mic.listening
                            ? "bg-accent text-primary"
                            : "border border-line bg-surface-2/60 text-muted hover:border-accent/50 hover:text-accent"
                        }`}
                      >
                        {mic.listening ? (
                          <Waveform level={mic.level} bars={5} className="text-primary" />
                        ) : (
                          <MicGlyph size={17} />
                        )}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!input.trim() || loading || mic.listening}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary transition-opacity disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <HiPaperAirplane className="text-base" />
                    </button>
                  </div>
                  <p className="mt-2 text-center font-mono text-[10px] text-faint">
                    AI can make mistakes · grounded in Jai&apos;s portfolio data
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
