import { NextRequest, NextResponse } from "next/server";
import { getFarmingAnswer } from "@/lib/sarvam";
import { prisma } from "@/lib/db";
import twilio from "twilio";

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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get("From") as string; // e.g. whatsapp:+919876543210
  const body = formData.get("Body") as string;
  const profileName = formData.get("ProfileName") as string || "Farmer";

  if (!body || !from) {
    return new NextResponse("OK");
  }

  const phoneNumber = from.replace("whatsapp:", "");
  const language = detectLanguage(body);

  // Find or create a WhatsApp "call" session for this farmer
  let session = await prisma.call.findFirst({
    where: {
      fromNumber: phoneNumber,
      status: "in-progress",
      callSid: { startsWith: "WA_" },
    },
    include: { transcript: { orderBy: { timestamp: "asc" } } },
  });

  if (!session) {
    session = await prisma.call.create({
      data: {
        callSid: `WA_${phoneNumber}_${Date.now()}`,
        fromNumber: phoneNumber,
        toNumber: "WhatsApp",
        status: "in-progress",
        language,
      },
      include: { transcript: { orderBy: { timestamp: "asc" } } },
    });
  }

  // Save farmer message
  await prisma.message.create({
    data: {
      callId: session.id,
      role: "farmer",
      content: body,
    },
  });

  // Build conversation history
  const history = session.transcript.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Get AI answer
  const fallbackAnswer = language === "en-IN"
    ? "Sorry, the service is currently unavailable. Please try again later."
    : "माफ करें, अभी सेवा उपलब्ध नहीं है। कृपया बाद में प्रयास करें।";
  let answer = fallbackAnswer;
  try {
    answer = await getFarmingAnswer(body, history, language as any);
  } catch (err) {
    console.error("LLM error:", err);
  }

  // Save AI response
  await prisma.message.create({
    data: {
      callId: session.id,
      role: "assistant",
      content: answer,
    },
  });

  // Check if conversation should end
  const endKeywords = ["धन्यवाद", "bye", "goodbye", "thank you", "thanks", "बस", "ok bye", "ठीक है"];
  const wantsToEnd = endKeywords.some((kw) =>
    body.toLowerCase().includes(kw.toLowerCase())
  );

  if (wantsToEnd) {
    await prisma.call.update({
      where: { id: session.id },
      data: { status: "completed", endedAt: new Date() },
    });
  }

  // Reply via Twilio WhatsApp
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(answer);

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
