import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Topbar */}
      <Topbar />

      {/* Main content area — no left margin on mobile/tablet, sidebar margin on lg+ */}
      <main className="lg:ml-52 pt-12 pb-14 lg:pb-0 min-h-screen">
        <div className="p-4 sm:p-5">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
