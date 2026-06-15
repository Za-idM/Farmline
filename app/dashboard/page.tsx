"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Phone, CheckCircle, Clock, Activity, Trash2, Flame, TrendingUp, Snowflake,
  LayoutDashboard, Brain, MessageSquare, MessageCircle, Sprout, Settings, Search, Bell, User,
  Plus, Languages, Zap, Lock, ChevronRight, AlertTriangle, ExternalLink,
  Video, Camera, PhoneOff
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import CallTable from "@/components/CallTable";
import VoiceDemo from "@/components/VoiceDemo";
import Logo from "@/components/Logo";

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  avgDuration: number;
  hot: number;
  warm: number;
  cold: number;
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
  channel: string;
  leadScore: string | null;
}

interface CallsResponse {
  calls: Call[];
  total: number;
  page: number;
  totalPages: number;
}

export default function DashboardPage() {
  // Navigation tab state: "overview", "calls", "farmguru", "whatsapp", "expert"
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [stats, setStats] = useState<Stats | null>(null);
  const [callsData, setCallsData] = useState<CallsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tavus Video Avatar state
  const [tavusCallActive, setTavusCallActive] = useState(false);
  const [tavusUrl, setTavusUrl] = useState<string | null>(null);
  const [tavusLoading, setTavusLoading] = useState(false);
  const [tavusError, setTavusError] = useState<string | null>(null);

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

  const startTavusCall = async () => {
    setTavusLoading(true);
    setTavusError(null);
    try {
      const res = await fetch("/api/tavus", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize video session.");
      }
      setTavusUrl(data.conversation_url);
      setTavusCallActive(true);
    } catch (err: any) {
      console.error(err);
      setTavusError(err.message || "Failed to start Tavus video session.");
    } finally {
      setTavusLoading(false);
    }
  };

  const endTavusCall = () => {
    setTavusUrl(null);
    setTavusCallActive(false);
    setTavusError(null);
  };

  // Filter call list for Overview quick display or general search
  const getFilteredCalls = () => {
    if (!callsData?.calls) return [];
    if (!searchQuery) return callsData.calls;
    return callsData.calls.filter(call => 
      call.fromNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.summary && call.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      call.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 max-w-6xl">
            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-[#1b1c19] tracking-tight">System Performance & Stats</h2>
              <p className="text-sm text-[#414943] mt-0.5">Overview of real-time incoming sessions and consultation metrics.</p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Sessions"
                value={stats?.total ?? "—"}
                icon={<Phone size={20} className="text-primary" />}
                color="bg-[#bbeed1] text-primary"
              />
              <StatsCard
                title="Completed"
                value={stats?.completed ?? "—"}
                icon={<CheckCircle size={20} className="text-[#002113]" />}
                color="bg-[#bbeed1] text-[#002113]"
              />
              <StatsCard
                title="In Progress"
                value={stats?.inProgress ?? "—"}
                icon={<Activity size={20} className="text-[#765a05]" />}
                color="bg-[#ffd87c] text-[#795d08]"
              />
              <StatsCard
                title="Avg Duration"
                value={stats ? formatDuration(stats.avgDuration) : "—"}
                icon={<Clock size={20} className="text-[#452406]" />}
                color="bg-[#ffdcc5] text-[#301400]"
                subtitle="Per completed call"
              />
            </div>

            {/* Farmer Lead Classification cards */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#414943] uppercase tracking-wider">Farmer Query Categorization</h3>
                <p className="text-xs text-gray-400 mt-0.5">Categorized automatically based on LLM urgency score.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Hot Queries (Urgent)"
                  value={stats?.hot ?? "—"}
                  icon={<Flame size={20} className="text-[#ba1a1a]" />}
                  color="bg-[#ffdad6] text-[#93000a]"
                  subtitle="Disease outbreaks, pest attacks, irrigation failures"
                />
                <StatsCard
                  title="Warm Queries (Planning)"
                  value={stats?.warm ?? "—"}
                  icon={<TrendingUp size={20} className="text-[#765a05]" />}
                  color="bg-[#ffdf96] text-[#5a4400]"
                  subtitle="Fertilizer schedules, seed quality, mandi prices"
                />
                <StatsCard
                  title="Cold Queries (General)"
                  value={stats?.cold ?? "—"}
                  icon={<Snowflake size={20} className="text-[#414943]" />}
                  color="bg-[#eae8e3] text-[#1b1c19]"
                  subtitle="System setup tests, general greetings, basic advice"
                />
              </div>
            </div>

            {/* Quick logs */}
            <div className="bg-white rounded-2xl border border-[#eae8e3] p-6 shadow-[0_8px_30px_rgba(0,52,33,0.04)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-[#1b1c19]">Recent Farmer Inquiries</h3>
                  <p className="text-xs text-[#414943]">Last few active sessions on the helpline</p>
                </div>
                <button 
                  onClick={() => setActiveTab("calls")}
                  className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Logs</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {loading && !callsData ? (
                <div className="py-8 text-center text-[#414943] text-sm">Loading records...</div>
              ) : getFilteredCalls().length === 0 ? (
                <div className="py-8 text-center text-[#414943] text-sm">No recent inquiries to display.</div>
              ) : (
                <div className="space-y-4">
                  {getFilteredCalls().slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between border-b border-[#f0eee9] pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-semibold text-[#1b1c19]">{call.fromNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            call.channel === "whatsapp" 
                              ? "bg-[#bbeed1] text-[#003421] border border-[#9fd2b6]/30"
                              : "bg-[#eae8e3] text-[#1b1c19] border border-[#dbdad5]/40"
                          }`}>
                            {call.channel === "whatsapp" ? "💬 WhatsApp" : "📞 Voice"}
                          </span>
                          {call.leadScore && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              call.leadScore === "Hot"
                                ? "bg-[#ffdad6] text-[#ba1a1a]"
                                : call.leadScore === "Warm"
                                ? "bg-[#ffdf96] text-[#765a05]"
                                : "bg-[#eae8e3] text-[#414943]"
                            }`}>
                              {call.leadScore}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#414943] line-clamp-1 max-w-2xl font-light">
                          {call.summary || "Conversation active or summarized pending..."}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-400 block">
                          {new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button 
                          onClick={() => setActiveTab("calls")}
                          className="text-xs text-primary font-semibold hover:underline mt-1 block cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "calls":
        return (
          <div className="space-y-8 max-w-6xl">
            {/* Header Area */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1b1c19] tracking-tight">Call & Conversation Logs</h2>
                <p className="text-sm text-[#414943] mt-0.5">Browse transcripts, view AI summaries, and audit farmer consultation records.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="text-sm border border-[#eae8e3] bg-white rounded-xl px-4 py-2.5 text-[#1b1c19] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Clear All */}
                {(callsData?.total ?? 0) > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="flex items-center gap-2 text-sm text-[#ba1a1a] border border-[#ffdad6] bg-[#ffdad6]/20 px-4 py-2.5 rounded-xl hover:bg-[#ffdad6]/50 transition-colors disabled:opacity-50 font-semibold cursor-pointer"
                  >
                    <Trash2 size={16} />
                    {clearing ? "Clearing..." : "Clear All Records"}
                  </button>
                )}
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-[#eae8e3] shadow-[0_8px_30px_rgba(0,52,33,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#eae8e3] flex justify-between items-center">
                <h3 className="font-bold text-[#1b1c19] text-base">Helpline Records ({callsData?.total ?? 0})</h3>
                <span className="text-xs text-[#414943]">Refreshes every 30 seconds</span>
              </div>

              {loading && !callsData ? (
                <div className="py-16 text-center text-[#414943]">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading calls...
                </div>
              ) : (
                <CallTable calls={getFilteredCalls()} onRefresh={fetchData} />
              )}

              {/* Pagination */}
              {callsData && callsData.totalPages > 1 && (
                <div className="p-4 bg-[#f5f3ee]/30 border-t border-[#eae8e3] flex items-center justify-between">
                  <p className="text-xs text-[#414943]">
                    Page {callsData.page} of {callsData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3.5 py-2 text-xs font-semibold border border-[#eae8e3] bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(callsData.totalPages, p + 1))}
                      disabled={page === callsData.totalPages}
                      className="px-3.5 py-2 text-xs font-semibold border border-[#eae8e3] bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "farmguru":
        return (
          <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-[#1b1c19] tracking-tight">FarmGuru AI Live Consult</h2>
              <p className="text-sm text-[#414943] mt-0.5">Test the AI voice-consultant directly from your microphone. Speak in your regional dialect.</p>
            </div>

            {/* Voice Demo Frame */}
            <div className="py-6">
              <VoiceDemo />
            </div>

            {/* Quick Tips */}
            <div className="bg-[#f0eee9]/60 border border-[#eae8e3] rounded-2xl p-6 max-w-2xl mx-auto space-y-3">
              <h4 className="font-bold text-[#1b1c19] text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-secondary" />
                <span>Demo Operator Instructions</span>
              </h4>
              <ul className="text-xs text-[#414943] space-y-2 list-disc pl-5 leading-relaxed font-light">
                <li>Select the language matching your speech from the dropdown in the header of the demo.</li>
                <li>Tap the green mic button, say your query (e.g., *“धान की फसल में खरपतवार कैसे रोकें?”*), and tap it again when finished.</li>
                <li>The AI utilizes Sarvam Speech-to-Text and Text-to-Speech models to generate natural voice answers. Make sure your speaker volume is turned up!</li>
              </ul>
            </div>
          </div>
        );

      case "whatsapp":
        return (
          <div className="space-y-8 max-w-6xl">
            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-[#1b1c19] tracking-tight">Connected Farming</h2>
              <p className="text-sm text-[#414943] mt-0.5">Configure, test, and preview the helpline's WhatsApp integration.</p>
            </div>

            {/* Main Center banner exactly matching screen.png */}
            <div className="bg-gradient-to-br from-[#1b4b36] to-[#003421] rounded-2xl p-10 text-white relative overflow-hidden shadow-[0_12px_40px_rgba(0,52,33,0.12)]">
              {/* Abstract Green Shape Overlay in right background */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial-gradient from-white to-transparent pointer-events-none" />

              <div className="grid md:grid-cols-5 gap-8 items-center relative z-10">
                {/* Banner Content (left) */}
                <div className="md:col-span-3 space-y-6">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Also on WhatsApp</h3>
                  <p className="text-[#89ba9f] text-base leading-relaxed font-light max-w-md">
                    Farmers can text their questions on WhatsApp in their own language and get instant AI replies — Hindi, Tamil, Telugu, and 8 more Indian languages supported.
                  </p>

                  {/* Languages pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {["Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Gujarati"].map((l) => (
                      <span key={l} className="bg-white text-[#1b1c19] text-xs font-semibold px-4 py-2 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-105 duration-200">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* How to use inner card */}
                  <div className="bg-[#fbf9f4] text-[#1b1c19] rounded-2xl p-6 border border-[#eae8e3]/80 shadow-md max-w-lg space-y-4">
                    <h4 className="font-bold text-sm text-[#1b1c19] uppercase tracking-wider">How to use:</h4>
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          1
                        </div>
                        <span className="text-sm font-medium text-[#414943]">Save the WhatsApp number</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          2
                        </div>
                        <span className="text-sm font-medium text-[#414943]">
                          Send <code className="bg-[#f0eee9] text-primary px-1.5 py-0.5 rounded font-mono text-xs font-semibold">hi</code> to 415523-8886
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          3
                        </div>
                        <span className="text-sm font-medium text-[#414943]">Start asking farming questions!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Graphic (right) */}
                <div className="md:col-span-2 flex justify-center relative">
                  {/* Floating graphical elements mimicking screen.png */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Decorative backdrop blurred leaf picture frame */}
                    <div className="absolute inset-0 bg-[#89ba9f]/20 rounded-3xl rotate-12 blur-xs transform scale-90" />
                    {/* Floating green message block */}
                    <div className="w-40 h-40 bg-[#204f3a] rounded-3xl shadow-xl flex items-center justify-center border border-[#89ba9f]/30 relative z-10 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                      <MessageCircle size={72} className="text-[#89ba9f]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower feature detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Multilingual */}
              <div className="bg-white rounded-2xl border border-[#eae8e3] p-6 shadow-[0_8px_30px_rgba(0,52,33,0.04)] hover:shadow-[0_12px_32px_rgba(0,52,33,0.06)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#ffdcc5] flex items-center justify-center mb-5">
                  <Languages className="text-[#765a05]" size={22} />
                </div>
                <h4 className="font-bold text-base text-[#1b1c19] mb-2">Multilingual</h4>
                <p className="text-sm text-[#414943] leading-relaxed font-light">
                  Speak naturally. Our AI understands local dialects and farming terminology across India.
                </p>
              </div>

              {/* Instant Response */}
              <div className="bg-white rounded-2xl border border-[#eae8e3] p-6 shadow-[0_8px_30px_rgba(0,52,33,0.04)] hover:shadow-[0_12px_32px_rgba(0,52,33,0.06)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#bbeed1] flex items-center justify-center mb-5">
                  <Zap className="text-primary" size={22} />
                </div>
                <h4 className="font-bold text-base text-[#1b1c19] mb-2">Instant Response</h4>
                <p className="text-sm text-[#414943] leading-relaxed font-light">
                  Get expert-level advice on pests, weather, or crop pricing in under 10 seconds.
                </p>
              </div>

              {/* Secure & Private */}
              <div className="bg-white rounded-2xl border border-[#eae8e3] p-6 shadow-[0_8px_30px_rgba(0,52,33,0.04)] hover:shadow-[0_12px_32px_rgba(0,52,33,0.06)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#ffdcc5] flex items-center justify-center mb-5">
                  <Lock className="text-[#452406]" size={22} />
                </div>
                <h4 className="font-bold text-base text-[#1b1c19] mb-2">Secure & Private</h4>
                <p className="text-sm text-[#414943] leading-relaxed font-light">
                  Your farm data is encrypted and used only to provide you with better personal advice.
                </p>
              </div>
            </div>

            {/* Floating button */}
            <div className="fixed bottom-8 right-8 z-50">
              <a
                href="https://wa.me/14155238886?text=hi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 duration-200"
              >
                <MessageCircle size={18} />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        );

      case "expert":
        return (
          <div className="space-y-8 max-w-5xl">
            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-[#1b1c19] tracking-tight">Expert Video Consultation</h2>
              <p className="text-sm text-[#414943] mt-0.5">Connect face-to-face with Akrush AI, your digital agronomy twin powered by Tavus AI. Get instant, visual answers to crop diseases and soil problems.</p>
            </div>

            {/* Main Video Interface Card */}
            <div className="bg-white rounded-2xl border border-[#eae8e3] overflow-hidden shadow-[0_8px_30px_rgba(0,52,33,0.04)]">
              <div className="p-6 bg-[#003421] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Video size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Akrush AI Digital Twin Specialist</h3>
                    <p className="text-[10px] text-[#89ba9f] font-light">Real-time Conversational Video Avatar</p>
                  </div>
                </div>
                {tavusCallActive && (
                  <span className="flex items-center gap-1.5 bg-[#ba1a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    Live Call
                  </span>
                )}
              </div>

              <div className="p-8 flex flex-col items-center justify-center bg-[#fbf9f4]/40 min-h-[400px]">
                {tavusLoading ? (
                  <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-[#1b1c19]">Connecting to Tavus AI Video Pipeline...</p>
                    <p className="text-xs text-[#414943] font-light max-w-xs">Initializing your digital twin avatar. Please allow camera and microphone access when prompted.</p>
                  </div>
                ) : tavusCallActive && tavusUrl ? (
                  <div className="w-full space-y-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#eae8e3] bg-black shadow-inner">
                      <iframe
                        src={tavusUrl}
                        className="w-full h-full border-0"
                        allow="camera; microphone; display-capture; autoplay"
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={endTavusCall}
                        className="bg-[#ba1a1a] hover:bg-[#93000a] text-white font-semibold rounded-xl px-8 py-3.5 flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                      >
                        <PhoneOff size={16} />
                        <span>End Video Consultation</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center max-w-md space-y-6">
                    {/* Placeholder Video screen icon */}
                    <div className="w-24 h-24 rounded-full bg-[#bbeed1] flex items-center justify-center mx-auto text-primary">
                      <Camera size={36} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-[#1b1c19]">Consultation Room Ready</h4>
                      <p className="text-xs text-[#414943] font-light leading-relaxed">
                        Start a live video conversation. Our AI digital twin visualizes farming assistance, understands local crop issues, and answers in real-time.
                      </p>
                    </div>

                    {tavusError && (
                      <div className="bg-[#ffdad6] border border-[#ffdad6] text-[#93000a] text-xs p-4 rounded-xl space-y-2 text-left">
                        <p className="font-bold">⚠️ Video call failed:</p>
                        <p className="font-light">{tavusError}</p>
                        <p className="font-light pt-1 text-[10px]">
                          Get a valid API key from{" "}
                          <a
                            href="https://platform.tavus.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-semibold hover:text-[#ba1a1a]"
                          >
                            platform.tavus.io
                          </a>{" "}
                          and set <code className="bg-white/50 px-1 rounded">TAVUS_API_KEY</code> in your <code className="bg-white/50 px-1 rounded">.env</code> file.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={startTavusCall}
                      className="bg-[#003421] hover:bg-[#07462e] text-white font-semibold rounded-xl px-8 py-4 flex items-center gap-2 mx-auto shadow-[0_4px_12px_rgba(0,52,33,0.12)] cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200"
                    >
                      <Video size={18} />
                      <span>Start Video Consultation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* How to configure / setup credentials callout */}
            <div className="bg-[#f0eee9]/50 border border-[#eae8e3] rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-sm text-[#1b1c19] flex items-center gap-2">
                <AlertTriangle size={16} className="text-secondary" />
                <span>Operator Setup Instructions</span>
              </h4>
              <div className="text-xs text-[#414943] space-y-3 font-light leading-relaxed">
                <p>To connect the Akrush Live Video Avatar to Tavus AI, append the following credentials to your <code className="bg-white px-1.5 py-0.5 rounded font-mono border border-gray-200">.env</code> file:</p>
                <pre className="bg-[#eae8e3]/80 p-4 rounded-lg font-mono text-[10px] text-primary select-all leading-normal">
{`# Tavus AI Configuration
TAVUS_API_KEY="your_tavus_api_key_here"
TAVUS_REPLICA_ID="your_custom_replica_id_optional"
TAVUS_PERSONA_ID="your_custom_persona_id_optional"`}
                </pre>
                <p>
                  Create these keys in your <strong>[Tavus Developer Dashboard](https://docs.tavus.io)</strong>. Replicas define the visual avatar face (like stock characters or your twin), and Personas configure the prompt guidelines.
                </p>
              </div>
            </div>

            {/* Regional Escalate Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#414943] uppercase tracking-wider">Alternative Human Assistance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[#eae8e3] p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1b1c19]">Kisan Toll-Free Helpline</h4>
                    <p className="text-[10px] text-[#414943] font-light">Dial for regional agricultural assistance</p>
                  </div>
                  <a href="tel:18001801551" className="text-xs font-semibold text-primary border border-primary hover:bg-[#bbeed1] rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                    1800-180-1551
                  </a>
                </div>
                <div className="bg-white rounded-xl border border-[#eae8e3] p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1b1c19]">Regional Agronomist Hub</h4>
                    <p className="text-[10px] text-[#414943] font-light">Emergency crop infestation unit</p>
                  </div>
                  <a href="tel:+918045678901" className="text-xs font-semibold text-primary border border-primary hover:bg-[#bbeed1] rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                    +91 80 4567 8901
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fbf9f4]">
      {/* Sidebar navigation panel */}
      <aside className="w-72 bg-[#f5f3ee] border-r border-[#eae8e3] flex flex-col justify-between p-6 sticky top-0 h-screen shrink-0 z-20">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 shrink-0" />
            <div>
              <h2 className="font-bold text-[#1b1c19] tracking-tight leading-none text-base">Akrush</h2>
              <span className="text-[10px] text-[#414943] font-medium tracking-wide uppercase mt-1 block">Helpline Platform</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {[
              { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
              { id: "calls", label: "Call Logs", icon: <Phone size={18} /> },
              { id: "farmguru", label: "FarmGuru AI", icon: <Brain size={18} /> },
              { id: "whatsapp", label: "WhatsApp Buddy", icon: <MessageSquare size={18} /> },
              { id: "expert", label: "Expert Connect", icon: <Sprout size={18} /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery(""); // clear sub searches
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#003421] text-white shadow-[0_4px_12px_rgba(0,52,33,0.15)] font-semibold"
                      : "text-[#414943] hover:bg-[#eae8e3] hover:text-[#1b1c19]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#414943] hover:bg-[#eae8e3] hover:text-[#1b1c19] rounded-xl text-sm font-medium transition-colors cursor-pointer">
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button 
            onClick={() => setActiveTab("farmguru")}
            className="w-full bg-[#003421] text-white hover:bg-[#07462e] rounded-xl py-3.5 px-4 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,52,33,0.1)] hover:shadow-[0_6px_16px_rgba(0,52,33,0.18)] cursor-pointer"
          >
            <Plus size={16} />
            <span>New Consult</span>
          </button>
        </div>
      </aside>

      {/* Main Workspaces Layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar header */}
        <header className="h-20 bg-[#fbf9f4]/80 backdrop-blur-md border-b border-[#eae8e3] px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-[#1b1c19] leading-none">Akrush AI</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-[#414943] mt-1.5 font-medium uppercase tracking-wider">
              <span>Platform</span>
              <span className="text-gray-300 font-normal">/</span>
              <span className="text-primary">
                {activeTab === "whatsapp" ? "WhatsApp Buddy" : activeTab === "farmguru" ? "FarmGuru AI" : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Input bar */}
            <div className="relative w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farm records..."
                className="w-full bg-[#f0eee9] hover:bg-[#eae8e3]/80 focus:bg-white text-[#1b1c19] pl-10 pr-4 py-2.5 rounded-full text-xs font-medium outline-none border border-transparent focus:border-[#c0c9c1] transition-all duration-200"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-[#414943] hover:text-[#1b1c19] hover:bg-[#f0eee9] rounded-full transition-colors relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
            
            <div className="h-6 w-px bg-[#eae8e3]" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-[#1b1c19] block leading-none">AgriAdvisor</span>
                <span className="text-[10px] text-gray-400 mt-1 block">Staff Role</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
