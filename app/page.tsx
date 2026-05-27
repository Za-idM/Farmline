import Link from "next/link";
import { Phone, Mic, Brain, Globe, BarChart3, Shield, MessageCircle } from "lucide-react";
import VoiceDemo from "@/components/VoiceDemo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Phone size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">Kisan Helpline</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#try-live" className="text-sm text-green-600 font-medium hover:text-green-800">
              Try Live
            </a>
            <a href="#whatsapp" className="text-sm text-gray-600 font-medium hover:text-gray-800">
              WhatsApp
            </a>
            <Link
              href="/dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          AI-Powered Farmer Support
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Kisan Helpline —<br />
          <span className="text-green-600">AI that speaks your language</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Farmers get instant AI-powered answers to their crop, soil, pest, and
          farming queries — by voice or WhatsApp — in Hindi, Tamil, Telugu, and 8
          more Indian languages.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="#try-live"
            className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            🎙️ Try it Live
          </a>
          <a
            href="#whatsapp"
            className="bg-[#25D366] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#1ebe5d] transition-colors"
          >
            💬 WhatsApp
          </a>
          <Link
            href="/dashboard"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </section>

      {/* Live Demo */}
      <section id="try-live" className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Try it Live</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Click the mic, ask a farming question in your language, and hear the AI answer instantly.
              No app, no signup needed.
            </p>
          </div>
          <VoiceDemo />
        </div>
      </section>

      {/* WhatsApp Section */}
      <section id="whatsapp" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#f0fdf4] border border-green-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-[#25D366] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <MessageCircle size={40} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Also on WhatsApp</h2>
              <p className="text-gray-500 mb-4">
                Farmers can text their questions on WhatsApp in their own language and get instant AI replies —
                Hindi, Tamil, Telugu, and 8 more Indian languages supported.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-5">
                {["Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Gujarati"].map((l) => (
                  <span key={l} className="bg-white border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                    {l}
                  </span>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm text-gray-600 space-y-2 max-w-sm mx-auto md:mx-0">
                <p className="font-medium text-gray-700">How to use:</p>
                <p>1. Save the WhatsApp number</p>
                <p>2. Send <span className="font-mono bg-gray-100 px-1 rounded">join &lt;sandbox-code&gt;</span></p>
                <p>3. Start asking farming questions!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Everything a farmer needs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic size={24} className="text-blue-600" />,
                bg: "bg-blue-50",
                title: "Voice-First",
                desc: "Speak naturally in your language. No typing, no app, no internet required for basic calls.",
              },
              {
                icon: <Globe size={24} className="text-green-600" />,
                bg: "bg-green-50",
                title: "11 Indian Languages",
                desc: "Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and English.",
              },
              {
                icon: <Brain size={24} className="text-purple-600" />,
                bg: "bg-purple-50",
                title: "Farming AI",
                desc: "Answers questions on crops, pests, soil, irrigation, weather, and government schemes.",
              },
              {
                icon: <MessageCircle size={24} className="text-[#25D366]" />,
                bg: "bg-green-50",
                title: "WhatsApp Support",
                desc: "Farmers can text questions on WhatsApp and get instant AI replies in their language.",
              },
              {
                icon: <BarChart3 size={24} className="text-orange-600" />,
                bg: "bg-orange-50",
                title: "Live Dashboard",
                desc: "Track every conversation, read transcripts, and view AI-generated summaries in real time.",
              },
              {
                icon: <Shield size={24} className="text-red-600" />,
                bg: "bg-red-50",
                title: "Powered by Sarvam AI",
                desc: "India-built AI with best-in-class accuracy for Indian languages and accents.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Voice */}
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Mic size={18} className="text-green-600" /> Voice Demo
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Click the mic", desc: "Allow microphone access and tap the green mic button." },
                  { step: "2", title: "Ask your question", desc: "Speak in Hindi, Tamil, Telugu or any supported language." },
                  { step: "3", title: "AI answers", desc: "Sarvam AI transcribes, understands, and speaks the answer back." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* WhatsApp */}
            <div>
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#25D366]" /> WhatsApp
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Join the sandbox", desc: "Send the join code to the Twilio WhatsApp sandbox number." },
                  { step: "2", title: "Text your question", desc: "Type any farming question in your language." },
                  { step: "3", title: "Get instant reply", desc: "AI replies in seconds with a helpful farming answer." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-[#25D366] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        Kisan Helpline · Powered by Sarvam AI & Twilio WhatsApp
      </footer>
    </div>
  );
}
