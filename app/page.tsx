import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import HomeView from "@/components/home/HomeView";

/*
 * Server component on purpose.
 *
 * The homepage is the page a search engine resolves "Jai Shankar" against, and
 * until this was rendered on the server it shipped no prose at all: the bio
 * arrived from an API call inside useEffect, so anything that does not run
 * JavaScript saw a skeleton. Googlebot renders JS and mostly coped; most of the
 * AI crawlers do not.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Jai Shankar — AI Engineer",
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { type: "profile", url: "/", title: SITE.title, description: SITE.description },
};

const DEFAULT_BIO =
  "I build things that listen. LLM agents in production by day; by night, systems built from the ground up: VAD, ASR, TTS and the real-time pipeline between them, a video retrieval stack, and an assistant that runs entirely on one machine.";

export default async function Home() {
  const [settings, skills, resume] = await Promise.all([
    prisma.siteContent.findMany().catch(() => []),
    prisma.skill.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(() => []),
    prisma.resume.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  const profile = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <HomeView
      profile={{
        profile_name: profile.profile_name,
        profile_title: profile.profile_title,
        profile_description: profile.profile_description || DEFAULT_BIO,
        profile_photo: profile.profile_photo,
      }}
      skills={skills.map((s) => ({ id: s.id, name: s.name }))}
      resumeUrl={resume?.url ?? "/JaiShankar_cv.pdf"}
    />
  );
}
