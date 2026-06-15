import Link from "next/link";
import { Phone, Mic, Brain, Globe, BarChart3, Shield, MessageCircle, ArrowRight, Sprout } from "lucide-react";
import VoiceDemo from "@/components/VoiceDemo";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#1b1c19]">
      {/* Nav bar */}
      <nav className="border-b border-[#eae8e3] px-6 py-5 sticky top-0 bg-[#fbf9f4]/95 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 shrink-0" />
            <div>
              <span className="font-bold text-[#1b1c19] text-base tracking-tight block">Akrush</span>
              <span className="text-[10px] text-[#414943] font-medium tracking-wide uppercase leading-none block">AI Farmer Support</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#try-live" className="text-xs text-[#414943] font-semibold hover:text-[#003421] uppercase tracking-wider transition-colors">
              Try Live
            </a>
            <a href="#whatsapp" className="text-xs text-[#414943] font-semibold hover:text-[#003421] uppercase tracking-wider transition-colors">
              WhatsApp
            </a>
            <Link
              href="/dashboard"
              className="bg-[#003421] text-white hover:bg-[#07462e] px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase shadow-[0_4px_12px_rgba(0,52,33,0.1)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Cinematic Video Background */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col items-center justify-center border-b border-[#eae8e3]">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <video
            src="https://res.cloudinary.com/de0zwiott/video/upload/v1780129696/vidssave.com_Video_Banner_Stock_Videos_-_Rural_Farming_Agriculture_Nature_1080p_1_nxw6tk.mp4"
            className="w-full h-full object-cover opacity-[0.80]"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Blend Gradient to transition into warm linen background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf9f4]/20 via-[#fbf9f4]/50 to-[#fbf9f4]" />
        </div>

        {/* Hero Content Wrapper (Glassmorphic Container) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 w-full">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 p-8 sm:p-12 md:p-16 shadow-[0_20px_50px_rgba(0,52,33,0.06)] space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-[#bbeed1]/90 text-[#002113] border border-[#9fd2b6]/40 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 bg-[#003421] rounded-full animate-pulse" />
              AI-Powered Farmer Support
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1b1c19] leading-tight tracking-tight max-w-3xl text-center">
              Akrush AI —<br />
              <span className="text-primary">Helpline that speaks your language</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#414943] max-w-2xl text-center font-light leading-relaxed">
              Farmers get instant AI-powered answers to their crop, soil, pest, and
              irrigation queries — by voice or WhatsApp — in Hindi, Tamil, Telugu, and 8
              more Indian languages.
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap pt-4 w-full">
              <a
                href="#try-live"
                className="bg-[#003421] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#07462e] transition-all shadow-[0_4px_12px_rgba(0,52,33,0.15)] cursor-pointer text-center min-w-[180px]"
              >
                🎙️ Try Voice Demo
              </a>
              <a
                href="#whatsapp"
                className="bg-[#25D366] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1ebe5d] transition-all shadow-[0_4px_12px_rgba(37,211,102,0.15)] cursor-pointer text-center min-w-[180px]"
              >
                💬 Test WhatsApp
              </a>
              <Link
                href="/dashboard"
                className="bg-white/80 border border-[#eae8e3] text-[#1b1c19] px-8 py-4 rounded-xl font-semibold hover:bg-[#f0eee9] transition-all shadow-sm cursor-pointer text-center min-w-[180px]"
              >
                Advisor Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Demo Section */}
      <section id="try-live" className="bg-[#f0eee9]/40 border-y border-[#eae8e3] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-[#1b1c19] tracking-tight">Try Voice Consultation</h2>
            <p className="text-[#414943] max-w-xl mx-auto font-light text-sm">
              Click the microphone, select your language, and ask a farming question. Our voice-agent answers instantly in regional speech.
            </p>
          </div>
          <VoiceDemo />
        </div>
      </section>

      {/* WhatsApp banner representation */}
      <section id="whatsapp" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#1b4b36] to-[#003421] rounded-2xl p-10 text-white relative overflow-hidden shadow-[0_12px_40px_rgba(0,52,33,0.12)]">
            <div className="grid md:grid-cols-5 gap-8 items-center relative z-10">
              <div className="md:col-span-3 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                  💬 Always Connected
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Also on WhatsApp</h3>
                <p className="text-[#89ba9f] text-sm leading-relaxed font-light">
                  Farmers can text their queries on WhatsApp in their own language and get instant AI replies in seconds — Hindi, Tamil, Telugu, and 8 more Indian languages supported.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Gujarati"].map((l) => (
                    <span key={l} className="bg-white text-[#1b1c19] text-[10px] font-semibold px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                      {l}
                    </span>
                  ))}
                </div>

                <div className="bg-[#fbf9f4] text-[#1b1c19] rounded-2xl p-6 border border-[#eae8e3]/80 shadow-md max-w-lg space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#003421]">How to use:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                      <span className="text-xs font-medium text-[#414943]">Save the WhatsApp number</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                      <span className="text-xs font-medium text-[#414943]">Send <code className="bg-[#f0eee9] text-primary px-1 py-0.5 rounded font-mono text-[10px] font-bold">hi</code> to 415523-8886</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#003421] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                      <span className="text-xs font-medium text-[#414943]">Start asking farming questions!</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-center">
                <div className="w-40 h-40 bg-[#204f3a] rounded-3xl shadow-xl flex items-center justify-center border border-[#89ba9f]/30">
                  <MessageCircle size={64} className="text-[#89ba9f]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#f0eee9]/40 border-t border-[#eae8e3] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-[#1b1c19] tracking-tight">Everything a farmer needs</h2>
            <p className="text-sm text-[#414943] max-w-xl mx-auto font-light">
              Designed from the ground up for simple, lightweight operation in rural bandwidth conditions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic size={22} className="text-[#765a05]" />,
                bg: "bg-[#ffdf96]/50",
                title: "Voice-First Support",
                desc: "Speak naturally in your local language. No typing, app installation, or complex mobile data plans required.",
              },
              {
                icon: <Globe size={22} className="text-primary" />,
                bg: "bg-[#bbeed1]/50",
                title: "11 Regional Languages",
                desc: "Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and Indian English.",
              },
              {
                icon: <Brain size={22} className="text-[#452406]" />,
                bg: "bg-[#ffdcc5]/50",
                title: "Farming Expertise AI",
                desc: "Get context-aware advice on crops, crop cycles, pests, soils, weather, and government MSP subsidies.",
              },
              {
                icon: <MessageCircle size={22} className="text-emerald-600" />,
                bg: "bg-[#bbeed1]/50",
                title: "WhatsApp Chatbot Integration",
                desc: "Farmers query directly over text or voice notes on WhatsApp to receive quick instructions and guides.",
              },
              {
                icon: <BarChart3 size={22} className="text-[#765a05]" />,
                bg: "bg-[#ffdf96]/50",
                title: "Real-time Dashboard",
                desc: "Enables agronomy managers to track active inquiries, review voice transcripts, and follow up on critical alerts.",
              },
              {
                icon: <Shield size={22} className="text-[#ba1a1a]" />,
                bg: "bg-[#ffdad6]/60",
                title: "Powered by Sarvam AI",
                desc: "Uses state-of-the-art Indian language models engineered specifically for regional accents and agricultural vernacular.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-[#eae8e3] shadow-[0_8px_30px_rgba(0,52,33,0.04)] hover:shadow-[0_12px_32px_rgba(0,52,33,0.06)] hover:border-[#c0c9c1] transition-all duration-300">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#1b1c19] text-base mb-2">{f.title}</h3>
                <p className="text-[#414943] text-xs leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eae8e3] py-12 text-center text-xs text-[#414943] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-light">
          <span>Akrush AI · AI-Powered Farmer Helpline</span>
          <span className="flex items-center gap-1.5">
            <Sprout size={14} className="text-primary animate-pulse" />
            <span>Cultivating Digital Stewardship</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
