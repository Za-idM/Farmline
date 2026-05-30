import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateFarmingAnswer,
  scoreLead,
  transcribeAudio,
  synthesizeSpeech
} from "@/lib/sarvam";
import { sendWhatsAppText, sendWhatsAppAudio } from "@/lib/twilio-whatsapp";
import { storeAudio } from "@/lib/audio-store";

// Detect language from text (simple heuristic based on Unicode ranges)
function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi/Devanagari
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam
  if (/[\u0980-\u09FF]/.test(text)) return "bn-IN"; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN"; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN"; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return "or-IN"; // Odia
  if (/[\u0900-\u097F]/.test(text)) return "mr-IN"; // Marathi (also Devanagari)
  return "en-IN"; // Default English
}

async function processMessage(
  from: string,
  body: string,
  msgSid: string,
  mediaUrl: string | null,
  mediaType: string | null
) {
  try {
    let transcript = body.trim();
    let language = "hi-IN";
    let isAudio = false;

    // 1. Check if it's an audio message (voice note)
    if (mediaUrl && mediaType && mediaType.startsWith("audio/")) {
      isAudio = true;
      console.log(`Processing WhatsApp audio message from ${mediaUrl}...`);
      try {
        const transcriptionResult = await transcribeAudio(mediaUrl);
        transcript = transcriptionResult.transcript;
        language = transcriptionResult.languageCode;
        console.log(`Transcription result: "${transcript}", detected language: ${language}`);
      } catch (transcribeErr) {
        console.error("Error transcribing WhatsApp voice note:", transcribeErr);
        if (transcript) {
          language = detectLanguage(transcript);
        } else {
          await sendWhatsAppText(
            from,
            "नमस्ते! मुझे आपका ऑडियो संदेश समझने में समस्या हुई। कृपया पुनः प्रयास करें।\nHello! I had trouble understanding your audio message. Please try again."
          );
          return;
        }
      }
    } else {
      language = detectLanguage(transcript);
    }

    if (!transcript) {
      await sendWhatsAppText(
        from,
        "नमस्ते! अपना सवाल बोलें या लिखें।\nHello! Please send a voice note or type your farming question."
      );
      return;
    }

    // 2. Save to DB
    const call = await prisma.call.create({
      data: {
        callSid: msgSid,
        fromNumber: from,
        toNumber: process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER || "whatsapp",
        status: "completed",
        language,
        channel: "whatsapp",
      },
    });

    await prisma.message.create({
      data: {
        callId: call.id,
        role: "farmer", // using 'farmer' to match dashboard styling
        content: transcript,
      },
    });

    // 3. Generate answer + score in parallel
    let [answer, leadScore] = await Promise.all([
      generateFarmingAnswer(transcript, language as any),
      scoreLead(transcript),
    ]);

    if (!answer || !answer.trim()) {
      answer = language === "hi-IN"
        ? "नमस्ते! मुझे आपके प्रश्न का उत्तर देने में समस्या आ रही है। कृपया अपना प्रश्न अधिक विवरण के साथ फिर से पूछें।"
        : "Hello! I am having trouble answering your question. Please ask again with more details.";
    }

    await prisma.message.create({
      data: {
        callId: call.id,
        role: "assistant",
        content: answer,
      },
    });

    // 4. Reply
    if (isAudio) {
      try {
        console.log(`Synthesizing response audio for language ${language}...`);
        const audioBuffer = await synthesizeSpeech(answer, language);
        
        const key = `wa_${msgSid}`;
        storeAudio(key, audioBuffer);
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const audioUrl = `${appUrl}/api/audio/${key}`;
        
        await sendWhatsAppAudio(from, answer, audioUrl);
      } catch (ttsErr) {
        console.error("TTS Synthesis or WhatsApp Audio Send failed, falling back to text:", ttsErr);
        await sendWhatsAppText(from, answer);
      }
    } else {
      await sendWhatsAppText(from, answer);
    }

    // 5. Update record
    await prisma.call.update({
      where: { id: call.id },
      data: {
        summary: answer.slice(0, 300),
        leadScore,
        endedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Error in background WhatsApp processing:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const from = (form.get("From") as string || "").replace("whatsapp:", "");
    const body = (form.get("Body") as string) ?? "";
    const msgSid = form.get("MessageSid") as string || `WA_temp_${Date.now()}`;
    const mediaUrl = form.get("MediaUrl0") as string || null;
    const mediaType = form.get("MediaContentType0") as string || null;

    if (!from) {
      return new NextResponse("Missing From parameter", { status: 400 });
    }

    console.log(`Received WhatsApp message from ${from}. Processing in background...`);

    // Process in the background to prevent Twilio request timeouts
    processMessage(from, body, msgSid, mediaUrl, mediaType)
      .catch(err => console.error("Background message process failed:", err));

    return new NextResponse("OK");
  } catch (err) {
    console.error("Error in WhatsApp webhook route:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
