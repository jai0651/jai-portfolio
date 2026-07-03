"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEnvelope, FaEnvelopeOpen, FaTrash } from "react-icons/fa";

interface Message {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  service: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMessages(1);
    }
  }, [session]);

  const fetchMessages = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead }),
      });
      setMessages(messages.map((m) => (m.id === id ? { ...m, isRead } : m)));
    } catch (e) {
      console.error("Failed to update message:", e);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      setMessages(messages.filter((m) => m.id !== id));
      setSelectedMessage(null);
    } catch (e) {
      console.error("Failed to delete message:", e);
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
          <h1 className="text-3xl font-bold text-accent">Messages</h1>
          <p className="text-white/60">Total: {pagination.total} messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1422] rounded-xl overflow-hidden border border-white/5">
          <div className="max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="p-6 text-white/60">No messages yet</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) markAsRead(message.id, true);
                  }}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-[#161d2e] transition-colors ${
                    selectedMessage?.id === message.id ? "bg-[#161d2e]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {message.isRead ? (
                        <FaEnvelopeOpen className="text-white/40" />
                      ) : (
                        <FaEnvelope className="text-accent" />
                      )}
                      <span
                        className={`font-medium ${
                          message.isRead ? "text-white/60" : "text-white"
                        }`}
                      >
                        {message.firstname} {message.lastname}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm truncate">{message.message}</p>
                </div>
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-white/5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchMessages(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-white/60 text-sm">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchMessages(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0f1422] rounded-xl p-6 border border-white/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedMessage.firstname} {selectedMessage.lastname}
                </h2>
                <p className="text-accent">{selectedMessage.email}</p>
                <p className="text-white/60 text-sm mt-1">
                  Service: {selectedMessage.service}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMessage(selectedMessage.id)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <FaTrash />
              </Button>
            </div>
            <div className="bg-[#0b0f19] rounded-lg p-4">
              <p className="text-white/80 whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>
            <p className="text-white/40 text-sm mt-4">
              Received: {new Date(selectedMessage.createdAt).toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

