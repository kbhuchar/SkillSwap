"use client";

import { useState } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

export default function LocationPrompt() {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!visible || done) return null;

  const handleAllow = async () => {
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      await fetch("/api/users/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      });
      setDone(true);
    } catch {
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl shadow-xl shadow-black/60 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#e5e5e5] leading-none mb-0.5">Enable location</p>
          <p className="text-[11px] text-[#666] leading-snug">Find people near you on Browse</p>
        </div>
        <button
          onClick={handleAllow}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {loading ? "Saving…" : "Allow"}
        </button>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 p-1 text-[#555] hover:text-[#888] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
