"use client";

import { useEffect, useState, useCallback } from "react";
import { Phone, CheckCircle, Clock, Activity, Trash2 } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import CallTable from "@/components/CallTable";

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  avgDuration: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface Call {
  id: string;
  callSid: string;
  fromNumber: string;
  toNumber: string;
  status: string;
  language: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  summary: string | null;
  transcript: Message[];
}

interface CallsResponse {
  calls: Call[];
  total: number;
  page: number;
  totalPages: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [callsData, setCallsData] = useState<CallsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, callsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch(`/api/calls?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`),
      ]);
      const [statsJson, callsJson] = await Promise.all([statsRes.json(), callsRes.json()]);
      setStats(statsJson);
      setCallsData(callsJson);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleClearAll() {
    if (!confirm("Clear ALL call records? This cannot be undone.")) return;
    setClearing(true);
    try {
      await fetch("/api/calls/clear", { method: "DELETE" });
      setPage(1);
      await fetchData();
    } finally {
      setClearing(false);
    }
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Kisan Helpline</h1>
              <p className="text-xs text-gray-400">AI Farmer Support Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-500">Live</span>
            <button
              onClick={fetchData}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Calls"
            value={stats?.total ?? "—"}
            icon={<Phone size={20} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatsCard
            title="Completed"
            value={stats?.completed ?? "—"}
            icon={<CheckCircle size={20} className="text-green-600" />}
            color="bg-green-50"
          />
          <StatsCard
            title="In Progress"
            value={stats?.inProgress ?? "—"}
            icon={<Activity size={20} className="text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatsCard
            title="Avg Duration"
            value={stats ? formatDuration(stats.avgDuration) : "—"}
            icon={<Clock size={20} className="text-purple-600" />}
            color="bg-purple-50"
            subtitle="per completed call"
          />
        </div>

        {/* Call Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Call Records</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {callsData?.total ?? 0} total calls
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="failed">Failed</option>
              </select>

              {/* Clear All */}
              {(callsData?.total ?? 0) > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {clearing ? "Clearing..." : "Clear All"}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading calls...
            </div>
          ) : (
            <CallTable calls={callsData?.calls || []} onRefresh={fetchData} />
          )}

          {/* Pagination */}
          {callsData && callsData.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {callsData.page} of {callsData.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(callsData.totalPages, p + 1))}
                  disabled={page === callsData.totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
