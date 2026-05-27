import { NextRequest, NextResponse } from "next/server";
import { getAudio } from "@/lib/audio-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const buf = getAudio(key);

  if (!buf) {
    console.error(`Audio not found for key: ${key}`);
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=300",
    },
  });
}
