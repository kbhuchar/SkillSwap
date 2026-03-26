"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isConversation = /^\/messages\/[^/]+/.test(pathname);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
      <main className={`${isConversation ? "" : "pt-12"} pb-14 lg:pb-8 min-h-screen`}>
        <div className="p-4 sm:p-5">{children}</div>
      </main>
      <MobileNav />
    </>
  );
}
