import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    total,
    completed,
    inProgress,
    failed,
    recentCalls,
    hot,
    warm,
    cold
  ] = await Promise.all([
    prisma.call.count(),
    prisma.call.count({ where: { status: "completed" } }),
    prisma.call.count({ where: { status: "in-progress" } }),
    prisma.call.count({ where: { status: "failed" } }),
    prisma.call.findMany({
      orderBy: { startedAt: "desc" },
      take: 5,
      include: { transcript: true },
    }),
    prisma.call.count({ where: { leadScore: "Hot" } }),
    prisma.call.count({ where: { leadScore: "Warm" } }),
    prisma.call.count({ where: { leadScore: "Cold" } }),
  ]);

  // Average duration of completed calls
  const durationResult = await prisma.call.aggregate({
    where: { status: "completed", duration: { not: null } },
    _avg: { duration: true },
  });

  return NextResponse.json({
    total,
    completed,
    inProgress,
    failed,
    avgDuration: Math.round(durationResult._avg.duration || 0),
    recentCalls,
    hot,
    warm,
    cold,
  });
}
