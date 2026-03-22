import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const skill = searchParams.get("skill");
  const type = searchParams.get("type") as "OFFERED" | "WANTED" | null;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    id: { not: session.user.id },
  };

  if (skill) {
    where.skills = {
      some: {
        type: type ?? "OFFERED",
        skill: { name: { contains: skill, mode: "insensitive" } },
      },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true,
        skills: {
          include: { skill: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}
