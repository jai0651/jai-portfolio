"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";

interface StatsData {
  stats_years?: string;
  stats_projects?: string;
  stats_technologies?: string;
  stats_commits?: string;
}

const Stats = () => {
  const [statsData, setStatsData] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setStatsData(data.settings);
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { key: "years", num: parseInt(statsData.stats_years || "2"), text: "years shipping" },
    { key: "projects", num: parseInt(statsData.stats_projects || "10"), text: "projects built" },
    { key: "technologies", num: parseInt(statsData.stats_technologies || "12"), text: "tools in the kit" },
    { key: "commits", num: parseInt(statsData.stats_commits || "200"), text: "commits pushed" },
  ];

  if (loading) return null;

  return (
    <section className="container mx-auto px-4 pb-20">
      <p className="mb-4 font-mono text-xs text-faint">
        <span className="text-accent-dim">$</span> stat --summary
      </p>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.key}
            className="group bg-surface p-6 transition-colors duration-300 hover:bg-surface-2"
          >
            <div className="flex items-baseline gap-1 font-mono">
              <span className="accent-text text-4xl font-semibold xl:text-5xl">
                <CountUp end={item.num} duration={2.2} delay={0.3} />
              </span>
              <span className="accent-text text-2xl">+</span>
            </div>
            <p className="mt-2 font-mono text-sm text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
