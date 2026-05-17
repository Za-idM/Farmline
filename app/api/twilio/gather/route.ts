import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFarmingAnswer, generateCallSummary } from "@/lib/sarvam";
import type { SarvamLanguage } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const callSid = searchParams.get("callSid") || "";

  const formData = await req.formData();
  const speechResult = formData.get("SpeechResult") as string;
  const confidence = formData.get("Confidence") as string;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!speechResult || speechResult.trim() === "") {
    // Nothing heard — ask again
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${appUrl}/api/twilio/gather?callSid=${callSid}" method="POST" language="hi-IN" speechTimeout="auto" timeout="8">
    <Say language="hi-IN" voice="Polly.Aditi">मुझे सुनाई नहीं दिया। कृपया दोबारा बोलें।</Say>
  </Gather>
</Response>`;
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Fetch call + conversation history
  const call = await prisma.call.findUnique({
    where: { callSid },
    include: { transcript: { orderBy: { timestamp: "asc" } } },
  });

  const language: SarvamLanguage = (call?.language as SarvamLanguage) || "hi-IN";

  // Save farmer's message
  if (call) {
    await prisma.message.create({
      data: {
        callId: call.id,
        role: "farmer",
        content: speechResult,
      },
    });
  }

  // Build conversation history for context
  const history = (call?.transcript || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Get AI answer from Sarvam
  let aiResponse = "मुझे खेद है, अभी सेवा उपलब्ध नहीं है।";
  try {
    aiResponse = await getFarmingAnswer(speechResult, history, language);
  } catch (err) {
    console.error("Sarvam LLM error:", err);
  }

  // Save AI response
  if (call) {
    await prisma.message.create({
      data: {
        callId: call.id,
        role: "assistant",
        content: aiResponse,
      },
    });
  }

  // Check if farmer wants to end the call
  const endKeywords = ["धन्यवाद", "bye", "goodbye", "thank you", "बस", "ठीक है बस"];
  const wantsToEnd = endKeywords.some((kw) =>
    speechResult.toLowerCase().includes(kw.toLowerCase())
  );

  if (wantsToEnd && call) {
    // Generate summary and close call
    const allMessages = await prisma.message.findMany({
      where: { callId: call.id },
      orderBy: { timestamp: "asc" },
    });

    let summary = "";
    try {
      summary = await generateCallSummary(
        allMessages.map((m) => ({ role: m.role, content: m.content }))
      );
    } catch (err) {
      console.error("Summary error:", err);
    }

    await prisma.call.update({
      where: { id: call.id },
      data: {
        status: "completed",
        endedAt: new Date(),
        summary,
      },
    });

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">${aiResponse} किसान हेल्पलाइन से बात करने के लिए धन्यवाद। नमस्ते!</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Continue conversation
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">${aiResponse}</Say>
  <Gather input="speech" action="${appUrl}/api/twilio/gather?callSid=${callSid}" method="POST" language="hi-IN" speechTimeout="auto" timeout="8">
    <Say language="hi-IN" voice="Polly.Aditi">क्या आपका कोई और सवाल है?</Say>
  </Gather>
  <Say language="hi-IN" voice="Polly.Aditi">किसान हेल्पलाइन से बात करने के लिए धन्यवाद। नमस्ते!</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
