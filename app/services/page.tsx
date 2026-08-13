"use client";

import { BsArrowUpRight } from "react-icons/bs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, step } from "@/lib/motion";

interface Service {
  id: string;
  num: string;
  title: string;
  description: string;
  href: string | null;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/admin/services");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services);
        }
      } catch (e) {
        console.error("Failed to fetch services:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <Section space="md">
        <div className="mb-14 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section space="md">
      <SectionHeader
        as="h1"
        cmd="cat ~/services.md"
        title={
          <>
            Services I <span className="gradient-text">offer</span>
          </>
        }
        sub="From idea to production — design, development, and applied AI, tailored to your goals."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map((service, index) => (
          <motion.div key={service.id} {...fadeUp} transition={step(index % 2)}>
            <Link
              href={service.href || "#"}
              className="card card-lift group relative block h-full overflow-hidden rounded-2xl p-8"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="flex items-start justify-between">
                <span className="text-outline group-hover:text-outline-hover tnum font-mono text-5xl font-bold text-transparent transition-all duration-500">
                  {service.num}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2 text-muted transition-all duration-500 ease-out-quint group-hover:rotate-45 group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent">
                  <BsArrowUpRight className="text-xl" />
                </span>
              </div>

              <h3 className="h3 mt-8 text-ink transition-colors duration-300 group-hover:text-accent">
                {service.title}
              </h3>
              <p className="prose-measure mt-3 text-[15px] leading-relaxed text-muted">
                {service.description}
              </p>
            </Link>
          </motion.div>
        ))}

        {services.length === 0 && (
          <p className="font-mono text-sm text-muted">
            <span className="text-accent-dim">#</span> no services listed yet.
          </p>
        )}
      </div>
    </Section>
  );
};

export default Services;
