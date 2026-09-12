"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEye, FaHeart, FaUsers, FaGlobeAmericas } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import WeeklyVisitsChart, { type WeekPoint } from "@/components/admin/WeeklyVisitsChart";
import RankedBars from "@/components/admin/RankedBars";

interface Analytics {
  totalVisitors: number;
  weekly: WeekPoint[];
  paths: { key: string; visits: number }[];
  countries: { key: string; visits: number }[];
  referers: { key: string; visits: number }[];
  posts: { slug: string; title: string; views: number; likes: number }[];
}

const RANGES = [
  { label: "12w", weeks: 12 },
  { label: "26w", weeks: 26 },
  { label: "52w", weeks: 52 },
];

/** A referer is a full URL; the host is the part worth ranking. */
const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [weeks, setWeeks] = useState(26);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (w: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?weeks=${w}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(weeks);
  }, [load, weeks]);

  const thisWeek = data?.weekly.at(-1)?.visits ?? 0;
  const prevWeek = data?.weekly.at(-2)?.visits ?? 0;
  const topPage = data?.paths[0];
  const topPost = data?.posts[0];

  const tiles = [
    { label: "Visitors, all time", value: data?.totalVisitors ?? 0, icon: <FaUsers /> },
    {
      label: "This week",
      value: thisWeek,
      icon: <FaEye />,
      note: prevWeek ? `${thisWeek >= prevWeek ? "+" : ""}${thisWeek - prevWeek} vs last week` : undefined,
    },
    { label: "Countries", value: data?.countries.length ?? 0, icon: <FaGlobeAmericas /> },
    { label: "Most liked post", value: topPost?.likes ?? 0, icon: <FaHeart />, note: topPost?.title },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Traffic by week, and what people actually read.
          </p>
        </div>

        {/* Filters sit in one row above the charts. */}
        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2/60 p-1 font-mono text-xs">
          {RANGES.map((r) => (
            <button
              key={r.weeks}
              type="button"
              onClick={() => setWeeks(r.weeks)}
              aria-pressed={weeks === r.weeks}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                weeks === r.weeks ? "bg-surface text-accent shadow-e1" : "text-muted hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <Skeleton className="h-[420px] w-full rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-lg border border-line bg-surface/70 p-4 shadow-e1">
                <div className="flex items-center gap-2 text-[12px] text-faint">
                  <span className="text-accent-dim">{t.icon}</span>
                  {t.label}
                </div>
                <div className="tnum mt-2 font-mono text-[26px] font-bold text-accent">
                  {t.value.toLocaleString()}
                </div>
                {t.note && <div className="mt-0.5 truncate text-[12px] text-faint">{t.note}</div>}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-line bg-surface/70 p-5 shadow-e1">
            <WeeklyVisitsChart data={data?.weekly ?? []} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface/70 p-5 shadow-e1">
              <RankedBars
                title="Most visited pages"
                sub="Per-page tracking started 12 Sep 2026; earlier rows only ever recorded the home page."
                items={data?.paths ?? []}
              />
            </div>

            <div className="rounded-lg border border-line bg-surface/70 p-5 shadow-e1">
              <RankedBars
                title="Where visitors are"
                sub="By IP geolocation, which is approximate and misses anyone on a VPN."
                items={data?.countries ?? []}
              />
            </div>

            <div className="rounded-lg border border-line bg-surface/70 p-5 shadow-e1">
              <RankedBars
                title="Referrers"
                sub="Where the click came from. Direct visits and privacy-preserving browsers send nothing."
                items={data?.referers ?? []}
                format={hostOf}
                empty="No referrers recorded yet."
              />
            </div>

            <div className="rounded-lg border border-line bg-surface/70 p-5 shadow-e1">
              <h2 className="font-mono text-[15px] font-semibold text-ink">Posts by views</h2>
              <p className="mt-0.5 mb-3 text-[13px] text-faint">
                Counted by the post page itself, one per reader per visit.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="border-b border-line px-2 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-faint">Post</th>
                      <th className="border-b border-line px-2 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-faint">Views</th>
                      <th className="border-b border-line px-2 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-faint">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.posts ?? []).map((p) => (
                      <tr key={p.slug}>
                        <td className="max-w-[260px] truncate border-b border-line px-2 py-2 text-ink" title={p.title}>
                          {p.title}
                        </td>
                        <td className="tnum border-b border-line px-2 py-2 text-right text-ink">{p.views}</td>
                        <td className="tnum border-b border-line px-2 py-2 text-right text-muted">{p.likes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
