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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        const [expRes, eduRes, skillsRes, settingsRes, achievementsRes] = await Promise.all([
          fetch("/api/admin/experience"),
          fetch("/api/admin/education"),
          fetch("/api/admin/skills"),
          fetch("/api/admin/settings"),
          fetch("/api/admin/achievements"),
        ]);

        if (expRes.ok) {
          const data = await expRes.json();
          setExperiences(data.experiences);
        }
        if (eduRes.ok) {
          const data = await eduRes.json();
          setEducation(data.education);
        }
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.skills);
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data.settings);
        }
        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          setAchievements(data.achievements);
        }
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    );
  }

  const about = {
    title: settings.about_title || "About me",
    description: settings.about_description || "",
    info: [
      { fieldName: "Name", fieldValue: settings.profile_name || "" },
      { fieldName: "Email", fieldValue: settings.profile_email || "" },
      { fieldName: "Freelance", fieldValue: settings.about_freelance || "" },
      { fieldName: "Languages", fieldValue: settings.about_languages || "" },
      { fieldName: "Experience", fieldValue: settings.about_experience || "" },
    ],
  };

  return (
    <div className="min-h-[80vh] py-12 xl:py-6">
      <div className="container mx-auto">
        <Tabs
          defaultValue="experience"
          className="flex flex-col xl:flex-row gap-[60px]"
        >
          <TabsList className="flex flex-col w-full max-w-[380px] mx-auto xl:mx-0 gap-4 xl:sticky xl:top-24 xl:self-start">
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="about">About me</TabsTrigger>
          </TabsList>
          <div className="w-full flex-1">
            <TabsContent value="experience" className="w-full">
              <div className="flex flex-col gap-[30px] text-center xl:text-left">
                <h3 className="text-4xl font-bold">My experience</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">
                  Professional experience in backend, frontend, and cloud-based development.
                </p>
                <ScrollArea className="h-[400px]">
                  <ul className="grid grid-cols-1 gap-[30px]">
                    {experiences.map((item) => (
                      <li
                        key={item.id}
                        className="bg-[#232329] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-2"
                      >
                        <span className="text-accent">{item.duration}</span>
                        <h3 className="text-xl text-center lg:text-left">
                          {item.position}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="w-[6px] h-[6px] rounded-full bg-accent"></span>
                          <p className="text-white/60">{item.company}</p>
                        </div>
                        {item.description && (
                          <p className="text-white/70 text-sm mt-2 whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="education" className="w-full">
              <div className="flex flex-col gap-[30px] text-center xl:text-left">
                <h3 className="text-4xl font-bold">My Education</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">
                  Academic background in engineering and computational mechanics.
                </p>
                <ScrollArea className="h-[400px]">
                  <ul className="grid grid-cols-1 gap-[30px]">
                    {education.map((item) => (
                      <li
                        key={item.id}
                        className="bg-[#232329] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-3"
                      >
                        <span className="text-accent">{item.duration}</span>
                        <h3 className="text-xl text-center lg:text-left">
                          {item.degree} - {item.major}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="w-[6px] h-[6px] rounded-full bg-accent"></span>
                          <p className="text-white/60">{item.university}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent value="skills" className="w-full h-full">
              <div className="flex flex-col gap-[30px]">
                <div className="flex flex-col gap-[30px] text-center xl:text-left">
                  <h3 className="text-4xl font-bold">My skills</h3>
                  <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">
                    Technical expertise in backend, frontend, AI, and cloud technologies.
                  </p>
                </div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 xl:gap-[30px]">
                  <TooltipProvider delayDuration={100}>
                    {skills.map((skill) => (
                      <li key={skill.id}>
                        <Tooltip>
                          <TooltipTrigger className="w-full h-[150px] bg-[#232329] rounded-xl flex justify-center items-center group">
                            <div className="text-6xl group-hover:text-accent transition-all duration-300">
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
              <div className="flex flex-col gap-[30px] text-center xl:text-left">
                <h3 className="text-4xl font-bold">My Achievements</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">
                  Recognition, certifications, and accomplishments.
                </p>
                <ScrollArea className="h-[400px]">
                  <ul className="grid grid-cols-1 gap-[30px]">
                    {achievements.map((item) => (
                      <li
                        key={item.id}
                        className="bg-[#232329] py-6 px-10 rounded-xl flex flex-col justify-center items-center lg:items-start gap-2"
                      >
                        {item.date && (
                          <span className="text-accent text-sm">{item.date}</span>
                        )}
                        <h3 className="text-xl text-center lg:text-left">
                          {item.title}
                        </h3>
                        {item.issuer && (
                          <div className="flex items-center gap-3">
                            <span className="w-[6px] h-[6px] rounded-full bg-accent"></span>
                            <p className="text-white/60">{item.issuer}</p>
                          </div>
                        )}
                        {item.description && (
                          <p className="text-white/70 text-sm mt-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-3">
                          {item.proofUrl && (
                            <a
                              href={item.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent hover:text-accent/80 text-sm"
                            >
                              <FaExternalLinkAlt /> View Proof
                            </a>
                          )}
                          {item.certificateUrl && (
                            <a
                              href={item.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent hover:text-accent/80 text-sm"
                            >
                              <FaCertificate /> Certificate
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                    {achievements.length === 0 && (
                      <p className="text-white/60 col-span-2 text-center">
                        No achievements listed yet.
                      </p>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            </TabsContent>
            <TabsContent
              value="about"
              className="w-full text-center xl:text-left"
            >
              <div className="flex flex-col gap-[30px]">
                <h3 className="text-4xl font-bold">{about.title}</h3>
                <p className="max-w-[600px] text-white/60 mx-auto xl:mx-0">
                  {about.description}
                </p>
                <ul className="grid grid-cols-1 xl:grid-cols-2 gap-y-6 max-w-[620px] mx-auto xl:mx-0">
                  {about.info
                    .filter((item) => item.fieldValue)
                    .map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-center xl:justify-start gap-4"
                      >
                        <span className="text-white/60">{item.fieldName}</span>
                        <span className="text-xl">{item.fieldValue}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Resume;
