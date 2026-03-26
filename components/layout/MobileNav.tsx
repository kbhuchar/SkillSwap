"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/messages/unread")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count ?? 0))
        .catch(() => {});

    fetch_();
    const interval = setInterval(fetch_, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Clear badge when navigating to messages
  useEffect(() => {
    if (pathname.startsWith("/messages")) setUnreadCount(0);
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#1a1a1a] border-t border-[#252525]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.href === "/messages" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                isActive ? "text-cyan-400" : "text-[#888] hover:text-[#e5e5e5]"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-cyan-500" />
              )}
              <div className="relative">
                <Icon className="w-5 h-5 flex-shrink-0" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
