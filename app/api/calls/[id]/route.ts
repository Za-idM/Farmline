import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const call = await prisma.call.findUnique({
    where: { id },
    include: { transcript: { orderBy: { timestamp: "asc" } } },
  });

  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  return NextResponse.json(call);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.call.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.call.update({
    where: { id },
    data: {
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.language !== undefined && { language: body.language }),
    },
    include: { transcript: { orderBy: { timestamp: "asc" } } },
  });

  return NextResponse.json(updated);
}
