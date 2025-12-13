"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMapMarkerAlt } from "react-icons/fa";

interface Visitor {
  id: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  userAgent: string | null;
  path: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

export default function VisitorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchVisitors(1);
    }
  }, [session]);

  const fetchVisitors = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visitors?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to fetch visitors:", e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <FaArrowLeft />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-accent">Visitors</h1>
          <p className="text-white/60">Total: {pagination.total} visitors</p>
        </div>
      </div>

      <div className="bg-[#27272c] rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1e1e21]">
              <tr>
                <th className="text-left p-4 text-white/60 font-medium">Location</th>
                <th className="text-left p-4 text-white/60 font-medium">IP Address</th>
                <th className="text-left p-4 text-white/60 font-medium">Page</th>
                <th className="text-left p-4 text-white/60 font-medium">Browser</th>
                <th className="text-left p-4 text-white/60 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  className="border-t border-white/5 hover:bg-[#323238] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-accent" />
                      <span className="text-white">
                        {visitor.city && visitor.country
                          ? `${visitor.city}, ${visitor.region || ""}, ${visitor.country}`
                          : "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-white/80">{visitor.ip || "N/A"}</td>
                  <td className="p-4 text-white/80">{visitor.path || "/"}</td>
                  <td className="p-4 text-white/60 text-sm max-w-[200px] truncate">
                    {visitor.userAgent?.split(" ")[0] || "Unknown"}
                  </td>
                  <td className="p-4 text-white/60">
                    {new Date(visitor.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-white/5">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => fetchVisitors(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-white/60">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchVisitors(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

