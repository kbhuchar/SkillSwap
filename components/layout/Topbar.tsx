"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  LogOut,
  ChevronDown,
  Zap,
  Menu,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = session?.user;
  const initials = getInitials(user?.name);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] border-b border-[#252525] z-30 px-5">
      <div className="flex items-center justify-between h-full">
        {/* Left: Menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[#888] hover:bg-[#252525] hover:text-[#e5e5e5] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Logo + Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#e5e5e5] tracking-wide">SkillSwap</span>
        </div>

        {/* Right: User avatar dropdown */}
        <div className="flex items-center" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-[#252525] transition-colors"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-900/30 text-violet-400 flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[#e5e5e5] leading-none">
                  {user?.name ?? "User"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-[#888] hidden sm:block transition-transform",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] rounded-xl shadow-lg shadow-black/40 border border-[#252525] py-1 z-50">
                <div className="px-3 py-2 border-b border-[#252525]">
                  <p className="text-xs font-medium text-[#e5e5e5]">{user?.name}</p>
                  <p className="text-xs text-[#888] truncate">{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#e5e5e5] hover:bg-[#252525] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#888]" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut({ redirectTo: "/login" });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
