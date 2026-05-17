import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Twilio calls this when a farmer dials in
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const callSid = formData.get("CallSid") as string;
  const from = formData.get("From") as string;
  const to = formData.get("To") as string;

  // Create call record in DB
  await prisma.call.create({
    data: {
      callSid,
      fromNumber: from || "unknown",
      toNumber: to || process.env.TWILIO_PHONE_NUMBER || "unknown",
      status: "in-progress",
      language: "hi-IN",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const gatherUrl = `${appUrl}/api/twilio/gather?callSid=${callSid}`;

  // Greet the farmer and gather their speech
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    नमस्ते! किसान हेल्पलाइन में आपका स्वागत है। मैं आपकी खेती से जुड़े सवालों में मदद करूंगा। कृपया अपना सवाल पूछें।
  </Say>
  <Gather input="speech" action="${gatherUrl}" method="POST" language="hi-IN" speechTimeout="auto" timeout="8">
    <Say language="hi-IN" voice="Polly.Aditi">बोलिए, मैं सुन रहा हूं।</Say>
  </Gather>
  <Say language="hi-IN" voice="Polly.Aditi">कोई आवाज़ नहीं आई। कृपया दोबारा कॉल करें।</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
