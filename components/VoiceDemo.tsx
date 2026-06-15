"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";

interface Message {
  role: "farmer" | "assistant";
  content: string;
}

const LANGUAGES = [
  { code: "hi-IN", label: "हिंदी (Hindi)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "en-IN", label: "English (Indian)" },
];

type Status = "idle" | "recording" | "processing" | "speaking" | "error";

export default function VoiceDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [language, setLanguage] = useState("hi-IN");
  const [history, setHistory] = useState<Message[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function startRecording() {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await processAudio();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch {
      setErrorMsg("Microphone access denied. Please allow mic access and try again.");
      setStatus("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setStatus("processing");
  }

  async function processAudio() {
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      fd.append("language", language);
      fd.append("history", JSON.stringify(history.map((m) => ({ role: m.role, content: m.content }))));

      const res = await fetch("/api/voice", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      // Add to conversation
      setHistory((prev) => [
        ...prev,
        { role: "farmer", content: data.transcript },
        { role: "assistant", content: data.answer },
      ]);

      // Play audio response
      if (data.audioBase64) {
        setStatus("speaking");
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))],
          { type: "audio/wav" }
        );
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setStatus("idle");
        };
        audio.onerror = () => setStatus("idle");
        await audio.play();
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to process audio. Please try again.");
      setStatus("error");
    }
  }

  function handleMicClick() {
    if (status === "recording") {
      stopRecording();
    } else if (status === "idle" || status === "error") {
      startRecording();
    }
  }

  function clearChat() {
    setHistory([]);
    setStatus("idle");
    setErrorMsg("");
  }

  const statusLabel: Record<Status, string> = {
    idle: "Tap the mic and ask your farming question",
    recording: "Listening... tap again to stop",
    processing: "Processing your question...",
    speaking: "AI is speaking...",
    error: errorMsg || "Something went wrong",
  };

  const micColors: Record<Status, string> = {
    idle: "bg-primary hover:bg-primary-hover",
    recording: "bg-[#ba1a1a] hover:bg-[#93000a] animate-pulse",
    processing: "bg-secondary cursor-not-allowed",
    speaking: "bg-primary-container text-on-primary-container cursor-not-allowed",
    error: "bg-primary hover:bg-primary-hover",
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,52,33,0.04)] border border-[#eae8e3] overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-container px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">🌾 Kisan AI — Live Demo</h3>
            <p className="text-on-primary-container text-sm mt-0.5">Ask any farming question</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="text-[#1b1c19] bg-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat area */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-[#fbf9f4]/50">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <Volume2 size={32} className="text-gray-300" />
            <p>Your conversation will appear here</p>
            <p className="text-xs">Try asking: "गेहूं में कौन सी खाद डालें?" or "When to sow wheat?"</p>
          </div>
        ) : (
          <>
            {history.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "farmer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "farmer"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white text-[#1b1c19] rounded-tl-none shadow-sm border border-[#eae8e3]"
                  }`}
                >
                  <p className={`text-[10px] mb-1 font-semibold tracking-wider uppercase ${msg.role === "farmer" ? "text-[#89ba9f]" : "text-gray-400"}`}>
                    {msg.role === "farmer" ? "🧑‍🌾 You" : "🤖 Kisan AI"}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-5 border-t border-[#eae8e3] bg-white">
        <div className="flex flex-col items-center gap-3">
          {/* Status */}
          <p className={`text-sm font-medium ${status === "error" ? "text-[#ba1a1a]" : "text-gray-500"}`}>
            {statusLabel[status]}
          </p>

          {/* Mic button */}
          <button
            onClick={handleMicClick}
            disabled={status === "processing" || status === "speaking"}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg cursor-pointer ${micColors[status]}`}
          >
            {status === "processing" ? (
              <Loader2 size={28} className="animate-spin" />
            ) : status === "recording" ? (
              <MicOff size={28} />
            ) : (
              <Mic size={28} />
            )}
          </button>

          {/* Clear */}
          {history.length > 0 && status === "idle" && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
