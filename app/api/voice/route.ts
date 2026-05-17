import { NextRequest, NextResponse } from "next/server";
import { getFarmingAnswer, textToSpeech } from "@/lib/sarvam";
import type { SarvamLanguage } from "@/lib/sarvam";

// Receives base64 audio from browser, returns base64 audio response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, language = "hi-IN", history = [] } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const lang = language as SarvamLanguage;

    // Step 1: Speech to Text
    const sttRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "saaras:v2",
        language_code: lang,
        audio: audioBase64,
      }),
    });

    if (!sttRes.ok) {
      const err = await sttRes.text();
      console.error("STT error:", err);
      return NextResponse.json({ error: "Speech recognition failed" }, { status: 500 });
    }

    const sttData = await sttRes.json();
    const transcript = sttData.transcript || "";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "Could not understand speech" }, { status: 400 });
    }

    // Step 2: LLM answer
    const answer = await getFarmingAnswer(transcript, history, lang);

    // Step 3: Text to Speech
    const audioResponse = await textToSpeech(answer, lang);

    return NextResponse.json({
      transcript,
      answer,
      audioBase64: audioResponse,
    });
  } catch (err) {
    console.error("Voice API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
