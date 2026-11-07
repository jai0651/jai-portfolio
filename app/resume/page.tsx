import type { Metadata } from "next";
import { FiArrowUpRight, FiDownload, FiMail } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";

/*
 * One scrolling page instead of tabs. Someone reading a resume wants to scan
 * all of it, and tabs showed one section at a time. Rendered on the server so
 * the whole thing is in the HTML; the admin routes call revalidatePublic, so
 * edits appear immediately.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Experience at Plivo and Hyperbots, a B.Tech from IIT Delhi, and the tools I use day to day.",
  alternates: { canonical: "/resume" },
};

/** The admin stores bullets as "• line" paragraphs; render them as a list. */
const toBullets = (text: string | null) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-*]\s*/, "").trim())
    .filter(Boolean);

/** "Sep 2025 - Present" → "Sep 2025 – present" */
const formatRange = (d: string) =>
  d.replace(/\s+-\s+/g, " – ").replace(/\bPresent\b/, "present");

export default async function ResumePage() {
  const [experiences, education, skills, achievements, settingsRows, resume] =
    await Promise.all([
      prisma.experience
        .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
        .catch(() => []),
      prisma.education
        .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
        .catch(() => []),
      prisma.skill
        .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
        .catch(() => []),
      prisma.achievement
        .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
        .catch(() => []),
      prisma.siteContent.findMany().catch(() => []),
      prisma.resume
        .findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } })
        .catch(() => null),
    ]);

  const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
  const cvUrl = resume?.url ?? settings.cv_url ?? "/JaiShankar_cv.pdf";
  const email = settings.profile_email;

  const sections = [
    { id: "experience", label: "Experience", show: experiences.length > 0 },
    { id: "education", label: "Education", show: education.length > 0 },
    { id: "skills", label: "Skills", show: skills.length > 0 },
    { id: "achievements", label: "Achievements", show: achievements.length > 0 },
  ].filter((s) => s.show);

  const facts = [
    settings.about_experience && { label: "Experience", value: settings.about_experience },
    settings.about_languages && { label: "Languages", value: settings.about_languages },
    { label: "Based in", value: "Bengaluru, India" },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Section space="md">
      <SectionHeader
        as="h1"
        cmd="cat ~/resume.md"
        title="Resume"
        meta={
          <Button asChild variant="cta" size="lg">
            <a href={cvUrl} download>
              <FiDownload />
              Download CV
            </a>
          </Button>
        }
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* On-page navigation, pinned on desktop */}
        <nav aria-label="Resume sections" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28 space-y-0.5 font-mono text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group flex min-h-10 items-center gap-3 text-muted transition-colors hover:text-accent"
                >
                  <span className="h-px w-4 bg-line-2 transition-all duration-300 group-hover:w-6 group-hover:bg-accent" />
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-20 lg:col-span-9">
          {/* Summary */}
          <div>
            {settings.about_description && (
              <p className="max-w-[68ch] text-lg leading-relaxed text-ink/90">
                {settings.about_description}
              </p>
            )}
            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
              {facts.map((f) => (
                <div key={f.label} className="bg-surface p-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-[15px] text-ink">{f.value}</dd>
                </div>
              ))}
              {email && (
                <div className="bg-surface p-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                    Email
                  </dt>
                  <dd className="mt-1 text-[15px]">
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-1.5 text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                    >
                      <FiMail className="shrink-0" />
                      <span className="whitespace-nowrap">{email}</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {experiences.length > 0 && (
            <ResumeSection id="experience" title="Experience">
              <ol className="space-y-12">
                {experiences.map((e) => (
                  <li key={e.id} className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-8">
                    <p className="tnum pt-1 font-mono text-sm text-accent-dim">
                      {formatRange(e.duration)}
                    </p>
                    <div>
                      <h3 className="text-xl font-semibold text-ink">
                        {e.position}, {e.company}
                      </h3>
                      {e.location && <p className="mt-1 text-sm text-faint">{e.location}</p>}
                      {toBullets(e.description).length > 0 && (
                        <ul className="mt-4 max-w-[68ch] space-y-2.5">
                          {toBullets(e.description).map((b) => (
                            <li
                              key={b}
                              className="relative pl-5 text-[15px] leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-2.5 before:rounded-full before:bg-accent/60"
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </ResumeSection>
          )}

          {education.length > 0 && (
            <ResumeSection id="education" title="Education">
              <ol className="space-y-8">
                {education.map((e) => (
                  <li key={e.id} className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-8">
                    <p className="tnum pt-1 font-mono text-sm text-accent-dim">
                      {formatRange(e.duration)}
                    </p>
                    <div>
                      <h3 className="text-xl font-semibold text-ink">
                        {e.degree}, {e.major}
                      </h3>
                      <p className="mt-1 text-[15px] text-muted">{e.university}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </ResumeSection>
          )}

          {skills.length > 0 && (
            <ResumeSection id="skills" title="Skills">
              <ul className="flex max-w-3xl flex-wrap gap-2">
                {skills.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-md border border-line bg-surface px-3 py-1.5 text-[15px] text-ink"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </ResumeSection>
          )}

          {achievements.length > 0 && (
            <ResumeSection id="achievements" title="Achievements">
              <ol className="space-y-8">
                {achievements.map((a) => (
                  <li key={a.id} className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-8">
                    <p className="tnum pt-1 font-mono text-sm text-accent-dim">{a.date}</p>
                    <div>
                      <h3 className="text-xl font-semibold text-ink">{a.title}</h3>
                      {a.issuer && <p className="mt-1 text-[15px] text-muted">{a.issuer}</p>}
                      {a.description && (
                        <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-muted">
                          {a.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-5 font-mono text-sm">
                        {a.proofUrl && (
                          <a
                            href={a.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 text-accent-dim hover:text-accent"
                          >
                            Proof <FiArrowUpRight />
                          </a>
                        )}
                        {a.certificateUrl && (
                          <a
                            href={a.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 text-accent-dim hover:text-accent"
                          >
                            Certificate <FiArrowUpRight />
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </ResumeSection>
          )}
        </div>
      </div>
    </Section>
  );
}

function ResumeSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-8 border-b border-line pb-3 font-mono text-xs uppercase tracking-[0.28em] text-accent-dim">
        {title}
      </h2>
      {children}
    </section>
  );
}
