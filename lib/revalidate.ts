import { revalidatePath } from "next/cache";

/*
 * The public pages are rendered on the server and cached. When the admin
 * panel changes the data behind one of them, refresh it straight away instead
 * of waiting out the page's revalidate window.
 */
const PAGES = {
  projects: ["/work"],
  experience: ["/resume"],
  education: ["/resume"],
  skills: ["/", "/resume"],
  achievements: ["/resume"],
  settings: ["/", "/resume", "/contact"],
  resume: ["/", "/resume"],
} as const;

export function revalidatePublic(source: keyof typeof PAGES) {
  for (const path of PAGES[source]) revalidatePath(path);
}
