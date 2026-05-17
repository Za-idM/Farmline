import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCallSummary } from "@/lib/sarvam";

// Twilio calls this when call status changes (completed, failed, etc.)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const callSid = formData.get("CallSid") as string;
  const callStatus = formData.get("CallStatus") as string;
  const callDuration = formData.get("CallDuration") as string;

  const call = await prisma.call.findUnique({
    where: { callSid },
    include: { transcript: { orderBy: { timestamp: "asc" } } },
  });

  if (!call) return new NextResponse("OK");

  const updateData: Record<string, unknown> = {
    status: callStatus === "completed" ? "completed" : "failed",
    endedAt: new Date(),
    duration: callDuration ? parseInt(callDuration) : null,
  };

  // Generate summary if not already done
  if (!call.summary && call.transcript.length > 0) {
    try {
      updateData.summary = await generateCallSummary(
        call.transcript.map((m) => ({ role: m.role, content: m.content }))
      );
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  }

  await prisma.call.update({
    where: { callSid },
    data: updateData,
  });

  return new NextResponse("OK");
}
