"use client";

import { format } from "date-fns";
import { X, Phone, Clock, MessageSquare, FileText } from "lucide-react";

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

interface Props {
  call: Call;
  onClose: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallDetailModal({ call, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Call Details</h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{call.fromNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={16} className="text-green-500" />
              <span>{call.fromNumber} → {call.toNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-blue-500" />
              <span>{formatDuration(call.duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare size={16} className="text-purple-500" />
              <span>{call.transcript.length} messages</span>
            </div>
            <div className="text-sm text-gray-600">
              {format(new Date(call.startedAt), "dd MMM yyyy, hh:mm a")}
            </div>
          </div>

          {/* Summary */}
          {call.summary && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">AI Summary</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{call.summary}</p>
            </div>
          )}

          {/* Transcript */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Conversation Transcript</h3>
            {call.transcript.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No transcript available</p>
            ) : (
              <div className="space-y-3">
                {call.transcript.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "farmer" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "farmer"
                          ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                          : "bg-green-600 text-white rounded-tr-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === "farmer" ? "text-gray-400" : "text-green-200"
                        }`}
                      >
                        {msg.role === "farmer" ? "🧑‍🌾 Farmer" : "🤖 AI"} ·{" "}
                        {format(new Date(msg.timestamp), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
