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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h3 className="font-mono text-2xl font-semibold text-ink xl:text-3xl">
      {title}
    </h3>
    <p className="mt-3 max-w-[600px] font-mono text-sm text-muted">{subtitle}</p>
  </div>
);

const TimelineCard = ({ children }: { children: React.ReactNode }) => (
  <li className="group relative rounded-lg border border-line bg-surface/70 p-6 pl-8 transition-all duration-200 hover:border-accent/40 hover:bg-surface-2/60">
    <span className="absolute left-0 top-6 h-[calc(100%-3rem)] w-[2px] rounded-full bg-accent/70" />
    {children}
  </li>
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
      <div className="container mx-auto px-4 py-16 xl:py-20">
        <div className="mb-12 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-96 max-w-full" />
        </div>
        <div className="flex flex-col gap-12 xl:flex-row">
          <div className="flex w-full max-w-[300px] flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="flex-1 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-16 xl:py-20"
    >
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 font-mono text-xs text-faint">
          <span className="text-accent-dim">$</span> cat ~/resume.md
        </p>
        <h2 className="h2">
          Experience &amp; <span className="gradient-text">credentials</span>
        </h2>
      </div>

      <Tabs
        defaultValue="experience"
        className="flex flex-col gap-12 xl:flex-row"
      >
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
              <SectionHeading
                title="My experience"
                subtitle="Professional experience across backend, frontend, and cloud-based development."
              />
              <ul className="grid grid-cols-1 gap-5">
                {experiences.map((item) => (
                  <TimelineCard key={item.id}>
                    <span className="font-mono text-sm text-accent">
                      {item.duration}
                    </span>
                    <h3 className="mt-1 text-xl font-semibold">{item.position}</h3>
                    <div className="mt-2 flex items-center gap-2 text-white/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {item.company}
                      {item.location ? ` · ${item.location}` : ""}
                    </div>
                    {item.description && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-white/65">
                        {item.description}
                      </p>
                    )}
                  </TimelineCard>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="education" className="w-full">
            <div className="flex flex-col gap-8">
              <SectionHeading
                title="My education"
                subtitle="Academic background in engineering and computer science."
              />
              <ul className="grid grid-cols-1 gap-5">
                {education.map((item) => (
                  <TimelineCard key={item.id}>
                    <span className="font-mono text-sm text-accent">
                      {item.duration}
                    </span>
                    <h3 className="mt-1 text-xl font-semibold">
                      {item.degree} — {item.major}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-white/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {item.university}
                    </div>
                  </TimelineCard>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="w-full">
            <div className="flex flex-col gap-8">
              <SectionHeading
                title="My skills"
                subtitle="Technical expertise across backend, frontend, AI, and cloud technologies."
              />
              <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                <TooltipProvider delayDuration={100}>
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <Tooltip>
                        <TooltipTrigger className="group flex aspect-square w-full items-center justify-center rounded-lg border border-line bg-surface/70 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface-2/60">
                          <div className="text-4xl text-muted transition-all duration-200 group-hover:scale-110 group-hover:text-accent md:text-5xl">
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
              <SectionHeading
                title="My achievements"
                subtitle="Recognition, certifications, and accomplishments."
              />
              <ul className="grid grid-cols-1 gap-5">
                {achievements.map((item) => (
                  <TimelineCard key={item.id}>
                    {item.date && (
                      <span className="font-mono text-sm text-accent">
                        {item.date}
                      </span>
                    )}
                    <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
                    {item.issuer && (
                      <div className="mt-2 flex items-center gap-2 text-white/55">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {item.issuer}
                      </div>
                    )}
                    {item.description && (
                      <p className="mt-3 text-sm text-white/65">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4">
                      {item.proofUrl && (
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-hover"
                        >
                          <FaExternalLinkAlt /> View proof
                        </a>
                      )}
                      {item.certificateUrl && (
                        <a
                          href={item.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-hover"
                        >
                          <FaCertificate /> Certificate
                        </a>
                      )}
                    </div>
                  </TimelineCard>
                ))}
                {achievements.length === 0 && (
                  <p className="text-white/50">No achievements listed yet.</p>
                )}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="about" className="w-full">
            <div className="flex flex-col gap-8">
              <SectionHeading title={about.title} subtitle={about.description} />
              <ul className="grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
                {about.info
                  .filter((item) => item.fieldValue)
                  .map((item, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-line bg-surface/70 p-5"
                    >
                      <span className="font-mono text-xs text-faint">
                        {item.fieldName.toLowerCase()}:
                      </span>
                      <p className="mt-1 font-mono text-ink">{item.fieldValue}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default Resume;
