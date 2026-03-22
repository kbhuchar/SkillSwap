import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, location, bio, skillsOffered = [], skillsWanted = [] } = await req.json();
  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(location?.trim() && { location: location.trim() }),
        ...(bio?.trim() && { bio: bio.trim() }),
        onboarded: true,
      },
    });

    for (const s of skillsOffered) {
      const skill = await tx.skill.upsert({
        where: { name: s.name },
        update: {},
        create: { name: s.name },
      });
      await tx.userSkill.upsert({
        where: { userId_skillId_type: { userId, skillId: skill.id, type: "OFFERED" } },
        update: {},
        create: { userId, skillId: skill.id, type: "OFFERED" },
      });
    }

    for (const s of skillsWanted) {
      const skill = await tx.skill.upsert({
        where: { name: s.name },
        update: {},
        create: { name: s.name },
      });
      await tx.userSkill.upsert({
        where: { userId_skillId_type: { userId, skillId: skill.id, type: "WANTED" } },
        update: {},
        create: { userId, skillId: skill.id, type: "WANTED" },
      });
    }
  });

  return NextResponse.json({ success: true });
}
