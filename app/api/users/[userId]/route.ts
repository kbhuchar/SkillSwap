import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
      createdAt: true,
      email: true,
      skills: { include: { skill: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  const { userId } = await params;

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { skillsOffered, skillsWanted, ...profileData } = parsed.data;

  // Update profile data
  const updateData: Record<string, unknown> = {};
  if (profileData.name !== undefined) updateData.name = profileData.name;
  if (profileData.bio !== undefined) updateData.bio = profileData.bio;
  if (profileData.location !== undefined) updateData.location = profileData.location;
  if (profileData.image !== undefined) updateData.image = profileData.image;

  // Handle skills update in a transaction
  const user = await prisma.$transaction(async (tx) => {
    if (skillsOffered !== undefined) {
      await tx.userSkill.deleteMany({ where: { userId, type: "OFFERED" } });
      for (const s of skillsOffered) {
        const skill = await tx.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name },
        });
        await tx.userSkill.create({
          data: { userId, skillId: skill.id, type: "OFFERED", level: s.level },
        });
      }
    }

    if (skillsWanted !== undefined) {
      await tx.userSkill.deleteMany({ where: { userId, type: "WANTED" } });
      for (const s of skillsWanted) {
        const skill = await tx.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name },
        });
        await tx.userSkill.create({
          data: { userId, skillId: skill.id, type: "WANTED", level: s.level },
        });
      }
    }

    return tx.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        skills: { include: { skill: true } },
      },
    });
  });

  return NextResponse.json(user);
}
