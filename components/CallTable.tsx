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
  completed: "bg-[#bbeed1] text-[#002113] border border-[#9fd2b6]/30",
  "in-progress": "bg-[#ffdf96] text-[#251a00] border border-[#e7c268]/30",
  failed: "bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]",
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
            <tr className="border-b border-[#eae8e3] bg-[#f5f3ee]/50">
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Farmer Number</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Channel</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Language</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Lead Score</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Status</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Duration</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Time</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Summary</th>
              <th className="text-left py-3.5 px-4 text-[#414943] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.id}
                className="border-b border-[#f0eee9] hover:bg-[#fbf9f4] transition-colors"
              >
                <td className="py-4 px-4 font-mono text-[#1b1c19] font-medium">{call.fromNumber}</td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                    call.channel === "whatsapp"
                      ? "bg-[#bbeed1] text-[#003421] border border-[#9fd2b6]/30"
                      : "bg-[#eae8e3] text-[#1b1c19] border border-[#dbdad5]/40"
                  }`}>
                    {call.channel === "whatsapp" ? "💬 WhatsApp" : "📞 Voice Call"}
                  </span>
                </td>
                <td className="py-4 px-4 text-[#414943] font-medium">
                  {languageLabels[call.language] || call.language}
                </td>
                <td className="py-4 px-4">
                  {call.leadScore ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      call.leadScore === "Hot"
                        ? "bg-[#ffdad6] text-[#93000a] border-[#ffdad6]"
                        : call.leadScore === "Warm"
                        ? "bg-[#ffdf96] text-[#795d08] border-[#ffdf96]"
                        : "bg-[#eae8e3] text-[#414943] border-[#eae8e3]"
                    }`}>
                      {call.leadScore}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      statusColors[call.status] || "bg-[#eae8e3] text-[#414943]"
                    }`}
                  >
                    {call.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-[#414943]">{formatDuration(call.duration)}</td>
                <td className="py-4 px-4 text-[#414943] text-xs">
                  {formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}
                </td>
                <td className="py-4 px-4 text-[#414943] max-w-xs truncate text-xs">
                  {call.summary || (
                    <span className="text-gray-300 italic">No summary yet</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="text-primary font-semibold hover:text-primary-hover text-xs underline cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditingCall(call)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-[#f0eee9] rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(call.id)}
                      disabled={deletingId === call.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-[#ffdad6]/40 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
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
