import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, skills: { take: 1 } },
  });

  // Already onboarded or already has skills → skip to dashboard
  if (user?.onboarded || (user?.skills && user.skills.length > 0)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
