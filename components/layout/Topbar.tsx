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
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#e5e5e5] tracking-wide">SkillSwap</span>
        </div>

        {/* Right: User avatar dropdown */}
        <div className="flex items-center" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center gap-2.5 py-1.5 pl-1.5 pr-2.5 rounded-xl transition-all duration-200",
                dropdownOpen ? "bg-[#252525]" : "hover:bg-[#252525]"
              )}
            >
              {/* Avatar */}
              <div className="relative">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? "User"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 text-cyan-400 flex items-center justify-center text-xs font-bold ring-2 ring-cyan-500/20">
                    {initials}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#1a1a1a]" />
              </div>

              {/* Name + email */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#e5e5e5] leading-none mb-0.5">
                  {user?.name ?? "User"}
                </p>
                <p className="text-[11px] text-[#666] leading-none truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[#555] hidden sm:block transition-transform duration-200",
                  dropdownOpen && "rotate-180 text-[#888]"
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1e1e1e] rounded-2xl shadow-xl shadow-black/60 border border-[#2a2a2a] overflow-hidden z-50">
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#ccc] hover:text-[#e5e5e5] hover:bg-[#252525] rounded-xl transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-[#888]" />
                    </div>
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ redirectTo: "/login" });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/90 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-3.5 h-3.5 text-red-400/70" />
                    </div>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
