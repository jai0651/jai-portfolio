"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiCopy, FiMail, FiMapPin, FiMessageCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Section from "@/components/Section";
import { fadeUpNow, lead } from "@/lib/motion";
import { sendContactForm } from "@/lib/sendContactForm";

const EMPTY = { name: "", email: "", topic: "", message: "" };

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
    {children}
  </label>
);

export default function ContactView({ email }: { email: string }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    // The API keeps first and last name separately; the form asks once.
    const [firstname, ...rest] = form.name.trim().split(/\s+/);
    const res = await sendContactForm({
      firstname,
      lastname: rest.join(" "),
      email: form.email.trim(),
      service: form.topic,
      message: form.message.trim(),
    });

    if (res.success) {
      setStatus("sent");
      setForm(EMPTY);
    } else {
      setStatus("error");
      setError(res.message || "That didn't send. Please try again, or email me directly.");
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the mailto link still works.
    }
  };

  return (
    <Section tone="hero" space="md">
      <motion.div {...fadeUpNow} transition={lead()}>
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs text-faint">
            <span className="text-accent-dim">$</span> ./send-message --to jai
          </p>
          <h1 className="mt-3 font-sans text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[56px]">
            Get in touch
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Tell me what you&apos;re working on. The form goes straight to my inbox and I reply
            by email. You can also write to me directly at{" "}
            <a
              href={`mailto:${email}`}
              className="text-ink underline decoration-line-2 underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              {email}
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <form
            onSubmit={onSubmit}
            className="card flex flex-col gap-6 rounded-2xl p-6 shadow-e2 sm:p-8 lg:col-span-7"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="topic">
                What&apos;s it about? <span className="font-normal text-faint">(optional)</span>
              </Label>
              <Select value={form.topic} onValueChange={(v) => setForm((f) => ({ ...f, topic: v }))}>
                <SelectTrigger id="topic" className="w-full">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">A role or opportunity</SelectItem>
                  <SelectItem value="collab">Working together on something</SelectItem>
                  <SelectItem value="ai">An AI or ML project</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="hello">Just saying hi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                className="h-[180px]"
                value={form.message}
                onChange={set("message")}
                required
              />
            </div>

            <Button type="submit" variant="cta" size="lg" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>

            <div aria-live="polite">
              {status === "sent" && (
                <p className="rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
                  Thanks, that reached me. I&apos;ll reply to the email you gave.
                </p>
              )}
              {status === "error" && (
                <p
                  role="alert"
                  className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
            </div>
          </form>

          <aside className="flex flex-col gap-4 lg:col-span-5">
            <div className="card p-5">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                <FiMail /> Email
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <a
                  href={`mailto:${email}`}
                  className="min-w-0 truncate text-[17px] text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? "Email address copied" : "Copy email address"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {copied ? <FiCheck className="text-accent" /> : <FiCopy />}
                </button>
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                <FiMapPin /> Based in
              </p>
              <p className="mt-2 text-[17px] text-ink">Bengaluru, India</p>
            </div>

            <div className="rounded-lg border border-accent/25 bg-accent/[0.05] p-5">
              <p className="font-semibold text-ink">Quick question?</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                My AI assistant can answer questions about my projects and experience. It works
                from the content on this site.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-chat", { detail: { mode: "text" } }))
                }
              >
                <FiMessageCircle /> Ask my AI
              </Button>
            </div>
          </aside>
        </div>
      </motion.div>
    </Section>
  );
}
