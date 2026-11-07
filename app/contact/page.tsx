import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ContactView from "@/components/contact/ContactView";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jai Shankar by email or through the contact form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const row = await prisma.siteContent
    .findUnique({ where: { key: "profile_email" } })
    .catch(() => null);

  return <ContactView email={row?.value || "jaimauryatech@gmail.com"} />;
}
