"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Calendar,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/matches", label: "Matches", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/sessions", label: "Sessions", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#242424] border-r border-[#333333] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-[#333333]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-white">SkillSwap</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-900/20 text-indigo-400"
                  : "text-gray-400 hover:bg-[#2e2e2e] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-indigo-400" : "text-gray-500"
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom hint */}
      <div className="px-4 py-4 border-t border-[#333333]">
        <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-800/30">
          <p className="text-xs font-semibold text-indigo-400 mb-1">
            Complete your profile
          </p>
          <p className="text-xs text-indigo-400/70 mb-3">
            Add skills to get better matches
          </p>
          <Link
            href="/profile"
            className="block text-center text-xs font-medium bg-indigo-600 text-white py-1.5 px-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to profile
          </Link>
        </div>
      </div>
    </aside>
  );
}
