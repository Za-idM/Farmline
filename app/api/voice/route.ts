import { NextRequest, NextResponse } from "next/server";
import { getFarmingAnswer, textToSpeech } from "@/lib/sarvam";
import type { SarvamLanguage } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "hi-IN";
    const historyRaw = formData.get("history") as string | null;
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    if (!audioFile) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const lang = language as SarvamLanguage;

    // Step 1: Speech to Text — send as multipart/form-data file
    const sttForm = new FormData();
    sttForm.append("file", audioFile, "audio.webm");
    sttForm.append("model", "saaras:v2");
    sttForm.append("language_code", lang);

    const sttRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY!,
      },
      body: sttForm,
    });

    if (!sttRes.ok) {
      const err = await sttRes.text();
      console.error("STT error:", err);
      return NextResponse.json({ error: "Speech recognition failed", detail: err }, { status: 500 });
    }

    const sttData = await sttRes.json();
    const transcript: string = sttData.transcript || "";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "Could not understand speech" }, { status: 400 });
    }

    // Step 2: LLM answer
    const answer = await getFarmingAnswer(transcript, history, lang);

    // Step 3: Text to Speech
    const audioBase64 = await textToSpeech(answer, lang);

    return NextResponse.json({ transcript, answer, audioBase64 });
  } catch (err) {
    console.error("Voice API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
