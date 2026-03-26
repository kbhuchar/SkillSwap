"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, UserCheck, Users } from "lucide-react";
import MatchCard from "./MatchCard";
import RequestActions from "./RequestActions";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import type { MatchWithUsers } from "@/types";

interface PendingMatch {
  id: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    skills: { skillId: string; type: string; level: string | null; skill: { name: string } }[];
  };
}

interface MatchesTabsProps {
  pendingIncoming: PendingMatch[];
  accepted: MatchWithUsers[];
  currentUserId: string;
  defaultTab?: string;
}

export default function MatchesTabs({ pendingIncoming, accepted, currentUserId, defaultTab = "connected" }: MatchesTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: "connected", label: "Connected", count: accepted.length, icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: "pending", label: "Pending", count: pendingIncoming.length, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-xl p-1 w-fit border border-[#252525]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#0d0d0d] text-[#e5e5e5] shadow-sm"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? tab.id === "pending"
                      ? "bg-amber-900/20 text-amber-400"
                      : "bg-emerald-900/20 text-emerald-400"
                    : "bg-[#252525] text-[#666]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending */}
      {activeTab === "pending" && (
        <div>
          {pendingIncoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#444]" />
              </div>
              <p className="text-sm font-semibold text-[#e5e5e5] mb-1">No pending requests</p>
              <p className="text-xs text-[#555] mb-5">When someone sends you a request, it'll appear here.</p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Browse Skills
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingIncoming.map((match) => {
                const initials = getInitials(match.sender.name);
                return (
                  <div key={match.id} className="bg-[#141414] rounded-xl border border-[#252525] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Link href={`/profile/${match.sender.id}`}>
                          {match.sender.image ? (
                            <img src={match.sender.image} alt={match.sender.name ?? ""} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-cyan-400 flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link href={`/profile/${match.sender.id}`} className="text-sm font-semibold text-[#e5e5e5] hover:text-cyan-400 transition-colors">
                            {match.sender.name ?? "Anonymous"}
                          </Link>
                          <p className="text-xs text-[#555]">Sent {formatRelativeTime(match.createdAt)}</p>
                        </div>
                      </div>
                      <RequestActions matchId={match.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Connected */}
      {activeTab === "connected" && (
        <div>
          {accepted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-[#444]" />
              </div>
              <p className="text-sm font-semibold text-[#e5e5e5] mb-1">No connections yet</p>
              <p className="text-xs text-[#555] mb-5">Accept requests or send new ones to start connecting.</p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Find People
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accepted.map((match) => (
                <MatchCard key={match.id} match={match} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
