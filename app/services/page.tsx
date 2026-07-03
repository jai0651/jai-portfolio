"use client";

import { BsArrowUpRight } from "react-icons/bs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <section className="container mx-auto px-4 py-16 xl:py-24">
        <div className="mb-14 max-w-2xl space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 xl:py-24">
      <div className="mb-14 max-w-2xl">
        <p className="mb-3 font-mono text-sm uppercase tracking-[0.3em] text-accent/90">
          What I do
        </p>
        <h2 className="h2 mb-4">
          Services I <span className="gradient-text">offer</span>
        </h2>
        <p className="text-white/60">
          From idea to production — design, development, and applied AI, tailored
          to your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Link
              href={service.href || "#"}
              className="group relative block h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.05]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <span className="font-mono text-5xl font-bold text-transparent text-outline transition-all duration-500 group-hover:text-outline-hover">
                  {service.num}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:text-accent">
                  <BsArrowUpRight className="text-xl" />
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-bold transition-colors duration-300 group-hover:text-accent">
                {service.title}
              </h3>
              <p className="mt-3 text-white/60">{service.description}</p>
            </Link>
          </motion.div>
        ))}
        {services.length === 0 && (
          <p className="text-white/50">No services listed yet.</p>
        )}
      </div>
    </section>
  );
};

export default Services;
