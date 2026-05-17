import { NextRequest, NextResponse } from "next/server";
import { getFarmingAnswer, textToSpeech } from "@/lib/sarvam";
import type { SarvamLanguage } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  try {
    // Check API key first
    if (!process.env.SARVAM_API_KEY) {
      console.error("SARVAM_API_KEY is not set");
      return NextResponse.json({ error: "Server configuration error: API key missing" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "hi-IN";
    const historyRaw = formData.get("history") as string | null;
    const history = historyRaw ? JSON.parse(historyRaw) : [];

    if (!audioFile) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    console.log("Audio file size:", audioFile.size, "type:", audioFile.type, "language:", language);

    const lang = language as SarvamLanguage;

    // Step 1: Speech to Text
    const sttForm = new FormData();
    sttForm.append("file", audioFile, "audio.webm");
    sttForm.append("model", "saaras:v2");
    sttForm.append("language_code", lang);

    const sttRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: sttForm,
    });

    const sttText = await sttRes.text();
    console.log("STT status:", sttRes.status, "response:", sttText);

    if (!sttRes.ok) {
      return NextResponse.json({
        error: "Speech recognition failed",
        detail: sttText,
        status: sttRes.status,
      }, { status: 500 });
    }

    const sttData = JSON.parse(sttText);
    const transcript: string = sttData.transcript || "";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "Could not understand speech. Please speak clearly and try again." }, { status: 400 });
    }

    console.log("Transcript:", transcript);

    // Step 2: LLM answer
    const answer = await getFarmingAnswer(transcript, history, lang);
    console.log("Answer:", answer.substring(0, 100));

    // Step 3: Text to Speech
    const audioBase64 = await textToSpeech(answer, lang);

    return NextResponse.json({ transcript, answer, audioBase64 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Voice API error:", message);
    return NextResponse.json({ error: "Internal server error", detail: message }, { status: 500 });
  }
}
