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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/matches", label: "Matches", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/sessions", label: "Sessions", icon: Calendar },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#1a1a1a] border-r border-[#252525] flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#252525] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-[#e5e5e5]">SkillSwap</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:bg-[#252525] hover:text-[#e5e5e5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-cyan-600/10 text-cyan-400"
                    : "text-[#888] hover:bg-[#252525] hover:text-[#e5e5e5]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-cyan-400" : "text-[#888]"
                  )}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom hint */}
        <div className="px-3 py-3 border-t border-[#252525] flex-shrink-0">
          <div className="bg-cyan-600/10 rounded-lg p-3 border border-cyan-600/20">
            <p className="text-xs font-semibold text-cyan-400 mb-0.5">
              Complete your profile
            </p>
            <p className="text-xs text-[#888] mb-2">
              Add skills for better matches
            </p>
            <Link
              href="/profile"
              onClick={onClose}
              className="block text-center text-xs font-medium bg-cyan-600 text-white py-1 px-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              Go to profile
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
