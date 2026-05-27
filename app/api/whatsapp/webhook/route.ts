import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateFarmingAnswer,
  scoreLead
} from "@/lib/sarvam";
import { sendWhatsAppText } from "@/lib/twilio-whatsapp";

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
  msgSid: string
) {
  try {
    // 1. Language Detection from text
    const transcript = body.trim();
    const language = detectLanguage(transcript);

    if (!transcript) {
      await sendWhatsAppText(
        from,
        "नमस्ते! अपना सवाल लिखें।\nHello! Please type your farming question."
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

    // 4. Reply — send text immediately
    await sendWhatsAppText(from, answer);

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

    if (!from) {
      return new NextResponse("Missing From parameter", { status: 400 });
    }

    console.log(`Received WhatsApp message from ${from}. Processing in background...`);

    // Process in the background to prevent Twilio request timeouts
    processMessage(from, body, msgSid)
      .catch(err => console.error("Background message process failed:", err));

    return new NextResponse("OK");
  } catch (err) {
    console.error("Error in WhatsApp webhook route:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
