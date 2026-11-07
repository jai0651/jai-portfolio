import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { POST_FOR_REPO, detailFor, isRetired } from "@/lib/projects";
import WorkView from "@/components/work/WorkView";

/*
 * Rendered on the server so the project list is in the HTML. The admin
 * project routes call revalidatePublic("projects"), so edits show up
 * immediately; the window below is only a fallback.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description:
    "Speech, vision and agent systems built from scratch, and a live product, with an explainer, source code and write-ups for each.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const rows = await prisma.project
    .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  const projects = rows
    .filter((p) => !isRetired(p))
    .map((p) => {
      const github = p.github?.trim() || null;
      const detail = detailFor(p);
      return {
        id: p.id,
        num: p.num,
        category: p.category,
        title: p.title,
        // Only needed as a fallback when there is no explainer summary.
        description: detail ? "" : p.description,
        stack: p.stack,
        image: p.image,
        live: p.live?.trim() || null,
        github,
        post: (github && POST_FOR_REPO[github]) || null,
        slug: detail?.slug ?? null,
        // The explainer's one-liner is checked against the project's sources;
        // the database description is older and in places ahead of what shipped.
        summary: detail?.oneLiner ?? null,
        highlight: detail?.highlights[0] ?? null,
      };
    });

  return <WorkView projects={projects} />;
}
