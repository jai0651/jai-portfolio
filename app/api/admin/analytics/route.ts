import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/*
 * Aggregation happens in Postgres rather than by pulling rows into node. The
 * visitor table only grows, and a dashboard that loads every row to count them
 * gets slower every week it succeeds.
 *
 * Weeks are date_trunc('week'), which is ISO: Monday start.
 */
export const dynamic = "force-dynamic";

interface WeekRow { week: Date; visits: bigint; uniques: bigint }
interface CountRow { key: string | null; visits: bigint }


/*
 * A week with no visits returns no row, and plotting only the rows that exist
 * silently closes the gap - a quiet fortnight would render as two adjacent bars
 * and the time axis would lie. Missing weeks are filled with zero so the
 * spacing means what it looks like it means.
 */
function fillWeeks(
  rows: WeekRow[],
  weeks: number,
  n: (v: bigint) => number
): { week: string; visits: number; uniques: number }[] {
  const found = new Map(rows.map((r) => [r.week.toISOString().slice(0, 10), r]));

  // Walk back from this week's Monday, in UTC.
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));

  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    const hit = found.get(key);
    out.push({
      week: key,
      visits: hit ? n(hit.visits) : 0,
      uniques: hit ? n(hit.uniques) : 0,
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const weeks = Math.min(Math.max(Number(new URL(req.url).searchParams.get("weeks")) || 26, 4), 104);
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  try {
    const [weekly, paths, countries, referers, posts, total] = await Promise.all([
      prisma.$queryRaw<WeekRow[]>`
        SELECT date_trunc('week', "createdAt") AS week,
               count(*) AS visits,
               count(DISTINCT "ip") AS uniques
        FROM "Visitor"
        WHERE "createdAt" >= ${since}
        GROUP BY 1 ORDER BY 1 ASC`,
      prisma.$queryRaw<CountRow[]>`
        SELECT "path" AS key, count(*) AS visits
        FROM "Visitor"
        WHERE "createdAt" >= ${since}
        GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
      prisma.$queryRaw<CountRow[]>`
        SELECT "country" AS key, count(*) AS visits
        FROM "Visitor"
        WHERE "createdAt" >= ${since} AND "country" IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      prisma.$queryRaw<CountRow[]>`
        SELECT "referer" AS key, count(*) AS visits
        FROM "Visitor"
        WHERE "createdAt" >= ${since} AND "referer" IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, title: true, views: true, likes: true },
        orderBy: [{ views: "desc" }],
      }),
      prisma.visitor.count(),
    ]);

    const n = (v: bigint) => Number(v);

    return NextResponse.json({
      totalVisitors: total,
      weekly: fillWeeks(weekly, weeks, n),
      paths: paths.map((p) => ({ key: p.key ?? "unknown", visits: n(p.visits) })),
      countries: countries.map((c) => ({ key: c.key ?? "unknown", visits: n(c.visits) })),
      referers: referers.map((r) => ({ key: r.key ?? "unknown", visits: n(r.visits) })),
      posts,
    });
  } catch (error) {
    console.error("Analytics query failed:", error);
    return NextResponse.json({ message: "Failed to load analytics" }, { status: 500 });
  }
}
