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
    { num: parseInt(statsData.stats_years || "1"), text: "Years of experience" },
    { num: parseInt(statsData.stats_projects || "10"), text: "Projects completed" },
    { num: parseInt(statsData.stats_technologies || "8"), text: "Technologies mastered" },
    { num: parseInt(statsData.stats_commits || "200"), text: "Code commits" },
  ];

  if (loading) {
    return null;
  }

  return (
    <section className="pt-4 pb-12 xl:pt-0 xl:pb-0">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-6 max-w-[80vw] mx-auto xl:max-w-none">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex gap-4 items-center justify-center xl:justify-start"
            >
              <CountUp
                end={item.num}
                duration={5}
                delay={2}
                className="text-4xl xl:text-6xl font-extrabold text-accent"
              />
              <p
                className={`${
                  item.text.length < 15 ? "max-w-[100px]" : "max-w-[150px]"
                } leading-snug text-white/80`}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
