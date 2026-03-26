"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, MapPin, Loader2 } from "lucide-react";

const TYPE_TABS = [
  { value: "", label: "Everyone" },
  { value: "OFFERED", label: "Teaching" },
  { value: "WANTED", label: "Learning" },
];

const MILE_PRESETS = [10, 25, 50, 100, 999];
const MILE_LABELS: Record<number, string> = { 10: "10mi", 25: "25mi", 50: "50mi", 100: "100mi", 999: "100mi+" };

interface BrowseFiltersProps {
  hasLocation: boolean;
}

export default function BrowseFilters({ hasLocation }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [skill, setSkill] = useState(searchParams.get("skill") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [miles, setMiles] = useState<number | null>(
    searchParams.get("miles") ? parseInt(searchParams.get("miles")!) : null
  );

  useEffect(() => {
    const urlMiles = searchParams.get("miles");
    setMiles(urlMiles ? parseInt(urlMiles) : null);
  }, [searchParams]);
  const [focused, setFocused] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSaved, setLocationSaved] = useState(hasLocation);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams(skill, type, miles);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  const updateParams = useCallback(
    (skillVal: string, typeVal: string, milesVal: number | null) => {
      const params = new URLSearchParams();
      if (skillVal) params.set("skill", skillVal);
      if (typeVal) params.set("type", typeVal);
      if (milesVal) params.set("miles", String(milesVal));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateParams(skill, newType, miles);
  };

  const handleMilesChange = (newMiles: number | null) => {
    setMiles(newMiles);
    updateParams(skill, type, newMiles);
  };

  const handleClear = () => {
    setSkill("");
    setType("");
    setMiles(null);
    router.push(pathname);
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      await fetch("/api/users/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      });
      setLocationSaved(true);
      // Apply a default 25mi filter right after saving
      handleMilesChange(25);
    } catch {
      setLocationError("Location access denied or unavailable.");
    } finally {
      setLocationLoading(false);
    }
  };

  const activeFilterCount = (skill ? 1 : 0) + (type ? 1 : 0) + (miles ? 1 : 0);

  return (
    <div className="sticky top-16 z-20 bg-[#0d0d0d] py-3 -mx-4 sm:-mx-5 px-4 sm:px-5 border-b border-[#252525]/60 animate-fade-up-2">
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
              focused ? "text-cyan-400" : "text-[#888]"
            }`}
          />
          <input
            type="text"
            placeholder="Search by skill — Python, Guitar, Design…"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border bg-[#111111] text-[#e5e5e5] text-sm placeholder:text-[#555] focus:outline-none transition-all duration-200 border-[#252525] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
          />
          {skill && (
            <button
              onClick={() => { setSkill(""); updateParams("", type, miles); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-[#e5e5e5] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[#888]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>

          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                type === tab.value
                  ? "bg-cyan-600 text-white shadow-sm shadow-cyan-900/40"
                  : "bg-[#181818] text-[#888] border border-[#252525] hover:border-cyan-500/30 hover:text-[#e5e5e5]"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-4 bg-[#252525] mx-1" />

          {/* Location / miles filter */}
          {locationSaved ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              {MILE_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => handleMilesChange(miles === m ? null : m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    miles === m
                      ? "bg-cyan-600 text-white shadow-sm shadow-cyan-900/40"
                      : "bg-[#181818] text-[#888] border border-[#252525] hover:border-cyan-500/30 hover:text-[#e5e5e5]"
                  }`}
                >
                  {MILE_LABELS[m]}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={requestLocation}
              disabled={locationLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#181818] text-[#888] border border-[#252525] hover:border-cyan-500/30 hover:text-[#e5e5e5] transition-all duration-200 disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3" />
              )}
              {locationLoading ? "Locating…" : "Near me"}
            </button>
          )}

          {locationError && (
            <span className="text-[11px] text-red-400">{locationError}</span>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="ml-auto flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e5e5e5] transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
              <span className="w-4 h-4 rounded-full bg-cyan-600/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
