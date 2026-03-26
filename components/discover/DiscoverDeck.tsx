"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { X, Heart, MapPin, RefreshCw, Info } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { PublicUser } from "@/types";

const SWIPE_THRESHOLD = 80;

interface DiscoverDeckProps {
  users: PublicUser[];
}

export default function DiscoverDeck({ users }: DiscoverDeckProps) {
  const [queue, setQueue] = useState(users);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveDir, setLeaveDir] = useState<"left" | "right" | null>(null);
  const dragStartX = useRef(0);

  const current = queue[0];
  const next = queue[1];
  const afterNext = queue[2];

  const advance = useCallback(() => {
    setQueue((q) => q.slice(1));
    setDragX(0);
    setIsLeaving(false);
    setLeaveDir(null);
  }, []);

  const triggerLeave = useCallback(
    async (dir: "left" | "right") => {
      if (!current || isLeaving) return;
      setIsLeaving(true);
      setLeaveDir(dir);
      if (dir === "right") {
        try {
          await fetch("/api/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: current.id }),
          });
        } catch {}
      }
    },
    [current, isLeaving]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLeaving) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - dragStartX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) triggerLeave("right");
    else if (dragX < -SWIPE_THRESHOLD) triggerLeave("left");
    else setDragX(0);
  };

  const connectOpacity = Math.max(0, Math.min(dragX / 80, 1));
  const passOpacity = Math.max(0, Math.min(-dragX / 80, 1));

  const cardTransform = isLeaving
    ? `translateX(${leaveDir === "right" ? "130vw" : "-130vw"}) rotate(${leaveDir === "right" ? 22 : -22}deg)`
    : `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`;

  const cardTransition = isDragging ? "none" : "transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-[#444]" />
        </div>
        <div>
          <p className="font-semibold text-[#e5e5e5]">You've seen everyone</p>
          <p className="text-sm text-[#555] mt-1">Check back later for new people</p>
        </div>
        <Link href="/browse" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mt-1">
          Browse all →
        </Link>
      </div>
    );
  }

  const offeredSkills = current.skills.filter((s) => s.type === "OFFERED").slice(0, 3);
  const wantedSkills = current.skills.filter((s) => s.type === "WANTED").slice(0, 2);

  return (
    <div className="flex flex-col gap-4">
      {/* Card stack — fixed height */}
      <div className="relative h-[62dvh] max-h-[520px] min-h-[360px]">

        {/* Card 3 — furthest back */}
        {afterNext && (
          <div
            className="absolute inset-x-5 top-3 bottom-0 rounded-3xl bg-[#181818]"
            style={{ transform: "scaleX(0.90)", transformOrigin: "bottom center", zIndex: 0, opacity: 0.4 }}
          />
        )}

        {/* Card 2 — next */}
        {next && (
          <div
            className="absolute inset-x-3 top-1.5 bottom-0 rounded-3xl overflow-hidden bg-[#1a1a1a]"
            style={{ transform: "scaleX(0.95)", transformOrigin: "bottom center", zIndex: 1, opacity: 0.7 }}
          >
            {next.image && <img src={next.image} alt="" className="w-full h-full object-cover" draggable={false} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Current card */}
        <div
          className="absolute inset-x-0 top-0 bottom-0 rounded-3xl overflow-hidden bg-[#1a1a1a] select-none touch-none"
          style={{ zIndex: 2, transform: cardTransform, transition: cardTransition, cursor: isDragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTransitionEnd={() => { if (isLeaving) advance(); }}
        >
          {/* Photo */}
          {current.image ? (
            <img src={current.image} alt={current.name ?? ""} className="w-full h-full object-cover pointer-events-none" draggable={false} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-[#1a1a2e] to-[#0d0d0d] flex items-center justify-center">
              <span className="text-6xl font-black text-cyan-400/20 select-none">{getInitials(current.name)}</span>
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

          {/* CONNECT stamp */}
          <div className="absolute top-6 left-5 pointer-events-none -rotate-12" style={{ opacity: connectOpacity }}>
            <div className="border-[3px] border-emerald-400 rounded-xl px-3 py-1">
              <span className="text-emerald-400 font-black text-xl tracking-widest">CONNECT</span>
            </div>
          </div>

          {/* PASS stamp */}
          <div className="absolute top-6 right-5 pointer-events-none rotate-12" style={{ opacity: passOpacity }}>
            <div className="border-[3px] border-red-400 rounded-xl px-3 py-1">
              <span className="text-red-400 font-black text-xl tracking-widest">PASS</span>
            </div>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white leading-tight truncate">{current.name ?? "Anonymous"}</p>
                {current.location && (
                  <div className="flex items-center gap-1 mt-0.5 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{current.location}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {offeredSkills.map((s, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                      {s.skill.name}
                    </span>
                  ))}
                  {wantedSkills.map((s, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm">
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/profile/${current.id}`}
                className="pointer-events-auto flex-shrink-0 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => triggerLeave("left")}
          disabled={isLeaving}
          className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#777] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-40 shadow-md"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          onClick={() => triggerLeave("right")}
          disabled={isLeaving}
          className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-white hover:bg-cyan-500 transition-all disabled:opacity-40 shadow-lg shadow-cyan-900/40"
        >
          <Heart className="w-6 h-6" />
        </button>
      </div>

      {/* Progress hint */}
      <p className="text-center text-xs text-[#444]">{queue.length} left</p>
    </div>
  );
}
