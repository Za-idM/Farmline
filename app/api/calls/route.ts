import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [calls, total] = await Promise.all([
    prisma.call.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
      include: {
        transcript: {
          orderBy: { timestamp: "asc" },
        },
      },
    }),
    prisma.call.count({ where }),
  ]);

  return NextResponse.json({
    calls,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
