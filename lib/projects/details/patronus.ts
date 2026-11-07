import type { ProjectDetail } from "../types";

const detail: ProjectDetail = {
  slug: "patronus",
  match: { github: "https://github.com/theweekendworld-engg/ai-resume-builder" },
  title: "Patronus",
  oneLiner:
    "An AI career assistant that keeps a confirmed record of the work you shipped and writes your resumes and job-fit checks from it.",
  overview: [
    "Almost nobody keeps a record of their own work. So when review week, a promotion case or a job search arrives, you have two days to reconstruct eight months, and you write what you can remember, which is mostly the last three weeks.",
    "Patronus keeps the record as you go. You tell it what you shipped in one rough sentence, on the web or through a Telegram bot, and it comes back as a structured win that only enters your record when you confirm it. Everything it writes after that (tailored resumes, job-fit checks, notes to recruiters) is built from those confirmed wins, every line links back to one, and it cannot print a number that isn't in your log.",
  ],
  highlights: [
    { value: "~2,550", label: "automated tests passing in the suite (August 2026)" },
  ],
  how: [
    {
      title: "Log a win",
      body: "You type a note in the web chat or send it to the Telegram bot. One model call routes the message to an action from a closed list, and the draft comes back structured with your numbers untouched.",
    },
    {
      title: "Confirm it",
      body: "Nothing enters the record until you tap Confirm. That writes the evidence and the link to its claim in a single database transaction, and un-confirming reverses both.",
    },
    {
      title: "Retrieve what's shareable",
      body: "Wins live in Postgres with pgvector embeddings. Any retrieval that feeds a resume, cover letter or application answer filters on sensitivity = 'shareable' in the query itself, so confidential work never reaches a model.",
    },
    {
      title: "Generate behind a guard",
      body: "Every model call goes through one wrapper, generateStructured, which handles validation, retries, cost logging and a numeric guard. Any figure in the output that isn't in the source is stripped, and a claim that can't be grounded resolves to 'needs confirmation'.",
    },
    {
      title: "Run background work",
      body: "Scheduled work such as the nightly job watch runs on a Postgres job queue. A handler that would touch N users enqueues N child jobs instead, and unique dedupe keys make a double-fired cron a no-op. Vercel Hobby allows one cron a day, so a GitHub Actions workflow ticks the queue every 10 minutes.",
    },
  ],
  decisions: [
    {
      title: "Confidentiality is a query, not a prompt",
      body: "The easy way to keep confidential wins out of a resume is to ask the model to skip them. I filter them out in the database query instead, and the tests assert the filter rather than the model's output.",
    },
    {
      title: "Fail closed on truth",
      body: "Zero fabricated numbers is the pass condition, not a low rate. A claim that can't be positively grounded becomes 'needs confirmation', and errors and timeouts resolve downward, never up to 'grounded'.",
    },
    {
      title: "Deleting an agent instead of fixing it",
      body: "The old resume agent wrapped a tool-calling loop around the resume pipeline, threw away the model's own output, duplicated four pipeline steps as tools and fell back to the same pipeline call on failure. It was buying nothing, so I deleted it rather than migrating it.",
    },
    {
      title: "Moving vectors into Postgres",
      body: "Search started on Qdrant Cloud. When the free cluster was suspended every search failed, so I moved the vectors to pgvector behind the same client interface, with a contract test that holds the two to the same answers.",
    },
  ],
  stack: [
    { group: "Frontend", items: ["Next.js 16", "React 19", "Tailwind 4", "Radix"] },
    { group: "Backend", items: ["Bun", "Prisma 6", "Postgres (Supabase)", "pgvector", "Upstash", "workflow SDK"] },
    { group: "AI", items: ["AI SDK 6", "OpenAI"] },
    { group: "Auth and payments", items: ["Clerk", "Stripe"] },
    { group: "Channels", items: ["Web chat", "Telegram bot"] },
    { group: "Infra", items: ["Vercel", "Vercel Blob", "GitHub Actions"] },
  ],
  status: "Live at patronus.cv. The free plan works today; paid plans have not opened yet.",
  sources: [
    "http://localhost:3100/api/admin/projects (database entry)",
    "/Users/jai/Desktop/projects/startups_ideas/ai-resume-builder/README.md",
    "/Users/jai/Desktop/projects/startups_ideas/ai-resume-builder/CLAUDE.md",
    "https://www.patronus.cv",
  ],
};

export default detail;
