"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1400);
    const hide = setTimeout(() => setVisible(false), 1900);
    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#1a1a1a] flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-4 animate-pulse-once">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-900/60">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-extrabold text-white tracking-tight">
          Skill<span className="text-indigo-400">Swap</span>
        </span>
      </div>
    </div>
  );
}
