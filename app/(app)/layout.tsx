import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

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

      {/* Main content area */}
      <main className="lg:ml-52 pt-12 min-h-screen">
        <div className="p-4 sm:p-5">{children}</div>
      </main>
    </div>
  );
}
