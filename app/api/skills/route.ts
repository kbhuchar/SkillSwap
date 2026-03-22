import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 1) return NextResponse.json([]);

  const skills = await prisma.skill.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { name: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(skills.map((s) => s.name));
}
