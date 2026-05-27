"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import CallDetailModal from "./CallDetailModal";
import EditCallModal from "./EditCallModal";

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
  channel: string;
  leadScore: string | null;
}

interface CallTableProps {
  calls: Call[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const languageLabels: Record<string, string> = {
  "hi-IN": "Hindi",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "bn-IN": "Bengali",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "pa-IN": "Punjabi",
  "or-IN": "Odia",
  "en-IN": "English",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallTable({ calls, onRefresh }: CallTableProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this call record? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/calls/${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No calls yet</p>
        <p className="text-sm mt-1">Calls will appear here once farmers start calling</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Farmer Number</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Channel</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Language</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Lead Score</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Duration</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Time</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Summary</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-gray-700">{call.fromNumber}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                    call.channel === "whatsapp"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {call.channel === "whatsapp" ? "💬 WhatsApp" : "📞 Voice Call"}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {languageLabels[call.language] || call.language}
                </td>
                <td className="py-3 px-4">
                  {call.leadScore ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      call.leadScore === "Hot"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : call.leadScore === "Warm"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}>
                      {call.leadScore}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[call.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {call.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{formatDuration(call.duration)}</td>
                <td className="py-3 px-4 text-gray-500">
                  {formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}
                </td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                  {call.summary || (
                    <span className="text-gray-300 italic">No summary yet</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="text-green-600 hover:text-green-800 font-medium text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingCall(call)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(call.id)}
                      disabled={deletingId === call.id}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCall && (
        <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}

      {editingCall && (
        <EditCallModal
          call={editingCall}
          onClose={() => setEditingCall(null)}
          onSaved={() => { setEditingCall(null); onRefresh(); }}
        />
      )}
    </>
  );
}
