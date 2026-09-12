"use client";

/*
 * A ranked magnitude list: the bar is the comparison, the number at the tip is
 * the value. One series, so one hue and no legend. Rows are already sorted, so
 * the bar length repeats what the order says - which is the point, it makes the
 * gap between first and second readable rather than merely ordered.
 */
const SERIES = "#b5790a";

export interface RankedItem {
  key: string;
  visits: number;
  href?: string;
}

const RankedBars = ({
  title,
  sub,
  items,
  empty = "Nothing recorded yet.",
  format = (k: string) => k,
}: {
  title: string;
  sub?: string;
  items: RankedItem[];
  empty?: string;
  format?: (key: string) => string;
}) => {
  const max = Math.max(...items.map((i) => i.visits), 1);

  return (
    <div>
      <h2 className="font-mono text-[15px] font-semibold text-ink">{title}</h2>
      {sub && <p className="mt-0.5 mb-3 text-[13px] text-faint">{sub}</p>}

      {items.length === 0 ? (
        <p className="mt-2 font-mono text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="truncate font-mono text-[13px] text-ink" title={item.key}>
                  {format(item.key)}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.visits / max) * 100}%`, background: SERIES }}
                  />
                </div>
              </div>
              <span className="tnum font-mono text-[13px] text-muted">
                {item.visits.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RankedBars;
