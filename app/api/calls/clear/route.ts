import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE() {
  await prisma.message.deleteMany();
  await prisma.call.deleteMany();
  return NextResponse.json({ success: true });
}
