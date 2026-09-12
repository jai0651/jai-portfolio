import { Suspense } from "react";
import type { Metadata } from "next";
import Section from "@/components/Section";
import BlogList from "@/components/blog/BlogList";
import { formatDate, getPublishedPosts } from "@/lib/blog";

/*
 * Static, with the sort toggle handled on the client. The admin upload calls
 * revalidatePath("/blog"), so a newly published post appears immediately
 * rather than waiting out the window below.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Jai Shankar",
  description:
    "Technical writeups on voice AI, speech models, LLM agents and the systems underneath them.",
};

export default async function BlogIndex() {
  const posts = await getPublishedPosts("recent");

  // Dates are formatted here so the client bundle needs neither the date
  // helper's dependencies nor a Date across the serialization boundary.
  const items = posts.map(({ publishedAt, ...p }) => ({
    ...p,
    dateLabel: formatDate(publishedAt),
  }));

  return (
    <Section space="md">
      <Suspense fallback={null}>
        <BlogList posts={items} />
      </Suspense>
    </Section>
  );
}
