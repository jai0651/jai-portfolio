"use client";

import { useMemo, useState } from "react";

/*
 * Weekly visits as columns. Discrete buckets, one series, so: no legend (the
 * heading names it), one hue, and a direct label only on the busiest week.
 *
 * The fill is #b5790a rather than the site accent. The accent sits at OKLCH
 * L 0.80, too light to carry a large fill on this surface; this step is inside
 * the dark band and clears 3:1 against it. Text keeps the accent.
 */
const SERIES = "#b5790a";
const SERIES_HOVER = "#d99e2b";

export interface WeekPoint {
  week: string;
  visits: number;
  uniques: number;
}

/** "2026-09-07" -> "7 Sep" */
const label = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

/*
 * Clean axis ceiling just above the peak. The ladder is deliberately fine:
 * a coarse one rounds a peak of 110 up to 200 and spends half the plot on
 * empty space, which flattens every other bar into the baseline.
 */
function niceMax(v: number) {
  if (v <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => v <= s * pow)! * pow;
}

const WeeklyVisitsChart = ({ data }: { data: WeekPoint[] }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const { max, peakIndex } = useMemo(() => {
    const peak = data.reduce((best, d, i) => (d.visits > data[best].visits ? i : best), 0);
    return { max: niceMax(Math.max(...data.map((d) => d.visits), 1)), peakIndex: peak };
  }, [data]);

  const ticks = [max, max / 2, 0];
  const active = hover !== null ? data[hover] : null;

  if (!data.length) {
    return <p className="font-mono text-sm text-muted">No visits recorded in this window.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-[15px] font-semibold text-ink">Visits per week</h2>
          <p className="mt-0.5 text-[13px] text-faint">
            Weeks start Monday. Bar height is total visits; the tooltip also carries unique IPs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="shrink-0 rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:text-ink"
        >
          {asTable ? "chart" : "table"}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-[320px] overflow-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 bg-surface-2">
              <tr>
                <th className="border-b border-line px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-faint">Week of</th>
                <th className="border-b border-line px-3 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-faint">Visits</th>
                <th className="border-b border-line px-3 py-2 text-right font-mono text-[11px] uppercase tracking-wider text-faint">Unique</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.week}>
                  <td className="border-b border-line px-3 py-1.5 text-ink">{label(d.week)}</td>
                  <td className="tnum border-b border-line px-3 py-1.5 text-right text-ink">{d.visits}</td>
                  <td className="tnum border-b border-line px-3 py-1.5 text-right text-muted">{d.uniques}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          {/* plot */}
          <div className="relative flex h-[220px] gap-[2px] pl-10">
            {/* gridlines: hairline, solid, recessive */}
            {ticks.map((t) => (
              <div
                key={t}
                className="pointer-events-none absolute inset-x-0 left-10 flex items-center"
                style={{ bottom: `${(t / max) * 100}%` }}
              >
                <span className="tnum absolute -left-10 w-9 pr-1 text-right font-mono text-[10px] text-faint">
                  {t.toLocaleString()}
                </span>
                <span className="h-px w-full bg-line" />
              </div>
            ))}

            {data.map((d, i) => {
              const h = (d.visits / max) * 100;
              const isPeak = i === peakIndex && d.visits > 0;
              return (
                <button
                  key={d.week}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`Week of ${label(d.week)}: ${d.visits} visits, ${d.uniques} unique`}
                  className="group relative flex flex-1 cursor-default items-end justify-center rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span
                    className="relative w-full max-w-[24px] rounded-t-[4px] transition-colors"
                    style={{
                      height: `${Math.max(h, d.visits > 0 ? 1.5 : 0)}%`,
                      background: hover === i ? SERIES_HOVER : SERIES,
                    }}
                  >
                    {isPeak && (
                      <span className="tnum absolute -top-[15px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-muted">
                        {d.visits}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* x axis: first, peak and last only, so labels never collide */}
          <div className="mt-2 flex gap-[2px] pl-10 font-mono text-[10px] text-faint">
            {data.map((d, i) => (
              <span key={d.week} className="flex-1 overflow-visible whitespace-nowrap text-center">
                {i === 0 || i === data.length - 1 || i === peakIndex ? label(d.week) : ""}
              </span>
            ))}
          </div>

          {active && (
            <div className="pointer-events-none mt-3 inline-flex items-center gap-3 rounded-md border border-line bg-surface-2 px-3 py-2 shadow-e1">
              <span className="h-0.5 w-4 shrink-0 rounded-full" style={{ background: SERIES }} />
              <span className="tnum font-mono text-[15px] font-semibold text-ink">{active.visits}</span>
              <span className="text-[13px] text-muted">visits</span>
              <span className="tnum font-mono text-[15px] font-semibold text-ink">{active.uniques}</span>
              <span className="text-[13px] text-muted">unique</span>
              <span className="text-[13px] text-faint">week of {label(active.week)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyVisitsChart;
