"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import { fadeUpNow, lead } from "@/lib/motion";
import { sendContactForm } from "@/lib/sendContactForm";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("jaimauryatech@gmail.com");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings?.profile_email) setEmail(d.settings.profile_email);
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const response = await sendContactForm(formData);

    if (response.success) {
      setSuccess("Your message was sent successfully!");
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } else {
      setError(response.message || "Failed to send your message.");
    }
    setLoading(false);
  };

  const info = [
    { icon: <FaEnvelope />, title: "Email", description: email },
    { icon: <FaMapMarkerAlt />, title: "Location", description: "Bengaluru, India" },
  ];

  return (
    <Section tone="hero" space="md">
      <motion.div {...fadeUpNow} transition={lead()}>
        <div className="flex flex-col gap-8 xl:flex-row xl:gap-10">
          {/* Form */}
          <div className="order-2 xl:order-none xl:w-[58%]">
            <form
              onSubmit={handleSubmit}
              className="card flex flex-col gap-6 rounded-2xl p-7 shadow-e2 xl:p-10"
            >
              <div>
                <p className="font-mono text-xs text-faint">
                  <span className="text-accent-dim">$</span> ./send-message --to jai
                </p>
                <h1 className="h2 mt-3 text-ink">
                  Let&apos;s <span className="gradient-text">build something</span>
                </h1>
                <p className="prose-measure mt-3 text-[15px] leading-relaxed text-muted">
                  Fill in the details and I&apos;ll get back to you shortly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  name="firstname"
                  placeholder="First name"
                  aria-label="First name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="lastname"
                  placeholder="Last name"
                  aria-label="Last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  aria-label="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <Select
                value={formData.service}
                onValueChange={(value) =>
                  setFormData({ ...formData, service: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="What's this about?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>What&apos;s this about?</SelectLabel>
                    <SelectItem value="role">A role / opportunity</SelectItem>
                    <SelectItem value="collab">Collaboration</SelectItem>
                    <SelectItem value="ai">An AI / ML project</SelectItem>
                    <SelectItem value="research">Research / physics</SelectItem>
                    <SelectItem value="hello">Just saying hi</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Textarea
                name="message"
                className="h-[180px]"
                placeholder="Tell me about your project…"
                aria-label="Message"
                value={formData.message}
                onChange={handleChange}
                required
              />

              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "sending…" : "send message"}
              </Button>

              {success && (
                <p
                  role="status"
                  className="rounded-md border border-accent/30 bg-accent/10 p-3 font-mono text-sm text-accent"
                >
                  <span className="text-accent-dim">✓</span> {success}
                </p>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-sm text-red-400"
                >
                  <span>✗</span> {error}
                </p>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="order-1 flex flex-1 flex-col gap-4 xl:order-none">
            <ul className="flex flex-col gap-3">
              {info.map((item, index) => (
                <li key={index} className="card flex items-center gap-5 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-lg text-accent">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate font-mono text-[15px] text-ink">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-accent/25 bg-accent/[0.05] p-6 shadow-e1">
              <div className="flex items-center gap-2 font-mono text-accent">
                <HiSparkles className="text-lg" />
                <span className="font-semibold">in a hurry?</span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Ask my AI assistant anything about my skills, experience, or
                projects — it answers instantly using my real portfolio data.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.dispatchEvent(new Event("open-chat"))}
              >
                <HiSparkles /> chat with my AI
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
};

export default Contact;
