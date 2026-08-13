"use client";

import { useEffect, useState } from "react";
import {
  FaReact,
  FaNodeJs,
  FaJava,
  FaDocker,
  FaAws,
  FaJs,
  FaPython,
  FaGitAlt,
  FaLinux,
  FaDatabase,
  FaExternalLinkAlt,
  FaCertificate,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiSpringboot,
  SiTensorflow,
  SiApachekafka,
  SiKubernetes,
  SiPostgresql,
  SiMongodb,
  SiTypescript,
  SiTailwindcss,
  SiPrisma,
  SiGraphql,
  SiRedis,
  SiGooglecloud,
  SiFirebase,
} from "react-icons/si";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fadeUp, lead, step } from "@/lib/motion";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  description: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  issuer: string | null;
  proofUrl: string | null;
  certificateUrl: string | null;
}

interface Education {
  id: string;
  university: string;
  degree: string;
  major: string;
  duration: string;
}

interface Skill {
  id: string;
  name: string;
  icon: string;
}

interface Settings {
  about_title?: string;
  about_description?: string;
  profile_name?: string;
  profile_email?: string;
  about_freelance?: string;
  about_languages?: string;
  about_experience?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  FaReact: <FaReact />,
  FaJava: <FaJava />,
  SiNextdotjs: <SiNextdotjs />,
  SiSpringboot: <SiSpringboot />,
  FaJs: <FaJs />,
  FaNodeJs: <FaNodeJs />,
  FaAws: <FaAws />,
  FaDocker: <FaDocker />,
  SiMongodb: <SiMongodb />,
  SiPostgresql: <SiPostgresql />,
  SiKubernetes: <SiKubernetes />,
  SiApachekafka: <SiApachekafka />,
  SiTensorflow: <SiTensorflow />,
  FaPython: <FaPython />,
  FaGitAlt: <FaGitAlt />,
  FaLinux: <FaLinux />,
  FaDatabase: <FaDatabase />,
  SiTypescript: <SiTypescript />,
  SiTailwindcss: <SiTailwindcss />,
  SiPrisma: <SiPrisma />,
  SiGraphql: <SiGraphql />,
  SiRedis: <SiRedis />,
  SiGooglecloud: <SiGooglecloud />,
  SiFirebase: <SiFirebase />,
};

/** Heading for a tab panel — one level below the page's SectionHeader. */
const PanelHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="h3 text-ink">{title}</h2>
    {subtitle && (
      <p className="prose-measure mt-3 text-[15px] leading-relaxed text-muted">
        {subtitle}
      </p>
    )}
  </div>
);

/** Card with an accent rail down the left edge — the timeline spine. */
const TimelineCard = ({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) => (
  <motion.li
    {...fadeUp}
    transition={step(index, 0.05)}
    className="card card-lift group relative p-6 pl-8"
  >
    <span className="absolute left-0 top-6 h-[calc(100%-3rem)] w-[2px] rounded-full bg-accent/70 transition-colors duration-200 group-hover:bg-accent" />
    {children}
  </motion.li>
);

const Resume = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, eduRes, skillsRes, settingsRes, achievementsRes] =
          await Promise.all([
            fetch("/api/admin/experience"),
            fetch("/api/admin/education"),
            fetch("/api/admin/skills"),
            fetch("/api/admin/settings"),
            fetch("/api/admin/achievements"),
          ]);

        if (expRes.ok) setExperiences((await expRes.json()).experiences);
        if (eduRes.ok) setEducation((await eduRes.json()).education);
        if (skillsRes.ok) setSkills((await skillsRes.json()).skills);
        if (settingsRes.ok) setSettings((await settingsRes.json()).settings);
        if (achievementsRes.ok)
          setAchievements((await achievementsRes.json()).achievements);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Section space="md">
        <div className="mb-14 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-96 max-w-full" />
        </div>
        <div className="flex flex-col gap-12 xl:flex-row">
          <div className="flex w-full max-w-[240px] flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  const about = {
    title: settings.about_title || "About me",
    description: settings.about_description || "",
    info: [
      { fieldName: "Name", fieldValue: settings.profile_name || "" },
      { fieldName: "Email", fieldValue: settings.profile_email || "" },
      { fieldName: "Languages", fieldValue: settings.about_languages || "" },
      { fieldName: "Experience", fieldValue: settings.about_experience || "" },
    ],
  };

  return (
    <Section space="md">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={lead()}>
        <SectionHeader
          as="h1"
          cmd="cat ~/resume.md"
          title={
            <>
              Experience &amp; <span className="gradient-text">credentials</span>
            </>
          }
        />

        <Tabs defaultValue="experience" className="flex flex-col gap-12 xl:flex-row">
          <TabsList className="flex w-full max-w-[240px] flex-col gap-1 xl:sticky xl:top-28 xl:self-start">
            <TabsTrigger value="experience">experience</TabsTrigger>
            <TabsTrigger value="education">education</TabsTrigger>
            <TabsTrigger value="skills">skills</TabsTrigger>
            <TabsTrigger value="achievements">achievements</TabsTrigger>
            <TabsTrigger value="about">about</TabsTrigger>
          </TabsList>

          <div className="w-full flex-1">
            <TabsContent value="experience" className="w-full">
              <div className="flex flex-col gap-8">
                <PanelHeading
                  title="My experience"
                  subtitle="Professional experience across backend, frontend, and cloud-based development."
                />
                <ul className="grid grid-cols-1 gap-4">
                  {experiences.map((item, i) => (
                    <TimelineCard key={item.id} index={i}>
                      <span className="font-mono text-sm text-accent">
                        {item.duration}
                      </span>
                      <h3 className="h3 mt-1 text-ink">{item.position}</h3>
                      <div className="mt-2 flex items-center gap-2 text-[15px] text-muted">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </div>
                      {item.description && (
                        <p className="prose-measure mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                          {item.description}
                        </p>
                      )}
                    </TimelineCard>
                  ))}
                  {experiences.length === 0 && (
                    <p className="font-mono text-sm text-muted">
                      <span className="text-accent-dim">#</span> nothing listed yet.
                    </p>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="education" className="w-full">
              <div className="flex flex-col gap-8">
                <PanelHeading
                  title="My education"
                  subtitle="Academic background in engineering and computer science."
                />
                <ul className="grid grid-cols-1 gap-4">
                  {education.map((item, i) => (
                    <TimelineCard key={item.id} index={i}>
                      <span className="font-mono text-sm text-accent">
                        {item.duration}
                      </span>
                      <h3 className="h3 mt-1 text-ink">
                        {item.degree} — {item.major}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-[15px] text-muted">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item.university}
                      </div>
                    </TimelineCard>
                  ))}
                  {education.length === 0 && (
                    <p className="font-mono text-sm text-muted">
                      <span className="text-accent-dim">#</span> nothing listed yet.
                    </p>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="w-full">
              <div className="flex flex-col gap-8">
                <PanelHeading
                  title="My skills"
                  subtitle="Technical expertise across backend, frontend, AI, and cloud technologies."
                />
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  <TooltipProvider delayDuration={100}>
                    {skills.map((skill) => (
                      <li key={skill.id}>
                        <Tooltip>
                          <TooltipTrigger className="card card-lift flex aspect-square w-full items-center justify-center">
                            <div className="text-4xl text-muted transition-all duration-200 ease-out-quint hover:scale-110 hover:text-accent md:text-5xl">
                              {iconMap[skill.icon] || <FaReact />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="capitalize">{skill.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    ))}
                  </TooltipProvider>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="w-full">
              <div className="flex flex-col gap-8">
                <PanelHeading
                  title="My achievements"
                  subtitle="Recognition, certifications, and accomplishments."
                />
                <ul className="grid grid-cols-1 gap-4">
                  {achievements.map((item, i) => (
                    <TimelineCard key={item.id} index={i}>
                      {item.date && (
                        <span className="font-mono text-sm text-accent">
                          {item.date}
                        </span>
                      )}
                      <h3 className="h3 mt-1 text-ink">{item.title}</h3>
                      {item.issuer && (
                        <div className="mt-2 flex items-center gap-2 text-[15px] text-muted">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {item.issuer}
                        </div>
                      )}
                      {item.description && (
                        <p className="prose-measure mt-3 text-[15px] leading-relaxed text-muted">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 font-mono text-sm">
                        {item.proofUrl && (
                          <a
                            href={item.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-accent transition-colors hover:text-accent-hover"
                          >
                            <FaExternalLinkAlt /> view proof
                          </a>
                        )}
                        {item.certificateUrl && (
                          <a
                            href={item.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-accent transition-colors hover:text-accent-hover"
                          >
                            <FaCertificate /> certificate
                          </a>
                        )}
                      </div>
                    </TimelineCard>
                  ))}
                  {achievements.length === 0 && (
                    <p className="font-mono text-sm text-muted">
                      <span className="text-accent-dim">#</span> no achievements
                      listed yet.
                    </p>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="about" className="w-full">
              <div className="flex flex-col gap-8">
                <PanelHeading title={about.title} subtitle={about.description} />
                <ul className="grid max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-2">
                  {about.info
                    .filter((item) => item.fieldValue)
                    .map((item, index) => (
                      <li key={index} className="card p-5">
                        <span className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
                          {item.fieldName}
                        </span>
                        <p className="mt-1.5 font-mono text-[15px] text-ink">
                          {item.fieldValue}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </Section>
  );
};

export default Resume;
