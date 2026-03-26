import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, skills: { take: 1 } },
  });

  if (!dbUser?.onboarded && dbUser?.skills.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <AppShell>{children}</AppShell>
    </div>
  );
}
