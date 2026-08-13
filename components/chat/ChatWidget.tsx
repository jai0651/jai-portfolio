"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiSparkles, HiXMark, HiPaperAirplane } from "react-icons/hi2";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What are Jai's top skills?",
  "Summarize Jai's experience",
  "What projects has Jai built?",
  "Is Jai available for hire?",
];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openHandler = (e: Event) => {
      setOpen(true);
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message?.trim();
      if (msg) setTimeout(() => send(msg), 350);
    };
    window.addEventListener("open-chat", openHandler);
    return () => window.removeEventListener("open-chat", openHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
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

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
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

      // Add an empty assistant message we'll stream into.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

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
      }
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

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-accent py-3 pl-4 pr-5 font-mono text-sm font-medium text-primary shadow-glow-lg transition-all duration-200 ease-out-quint hover:-translate-y-px hover:bg-accent-hover"
            aria-label="Open AI chat assistant"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30 opacity-60" />
              <HiSparkles className="relative text-lg" />
            </span>
            <span>ask my AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="glass-strong fixed bottom-5 right-5 z-50 flex h-[min(600px,calc(100vh-2.5rem))] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-lg shadow-2xl shadow-black/50"
          >
            {/* Header — terminal bar */}
            <div className="term-bar justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-3.5 w-1 rounded-sm bg-accent shadow-[0_0_10px_rgba(240,180,41,0.7)]"
                />
                <span className="font-mono text-xs text-muted">
                  jai-assistant <span className="text-accent-dim">— zsh</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-faint transition-colors hover:bg-white/5 hover:text-ink"
                aria-label="Close chat"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
            >
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
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
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

              {loading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-md rounded-tl-sm border border-line bg-surface-2/60 px-4 py-3">
                      <span className="inline-flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-line bg-surface-2/50 p-3"
            >
              <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 focus-within:border-accent/50">
                <span className="font-mono text-sm text-accent-dim">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ask about Jai…"
                  className="flex-1 bg-transparent py-2 font-mono text-sm text-ink placeholder:text-faint focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
