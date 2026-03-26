"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, MapPin, Loader2, ChevronDown, LayoutGrid } from "lucide-react";

const CATEGORIES = [
  { value: "Technology", label: "Technology", icon: "💻" },
  { value: "Art & Design", label: "Art & Design", icon: "🎨" },
  { value: "Music", label: "Music", icon: "🎵" },
  { value: "Language", label: "Language", icon: "🌐" },
  { value: "Education", label: "Education", icon: "📚" },
  { value: "Sports & Fitness", label: "Sports", icon: "⚡" },
  { value: "Cooking", label: "Cooking", icon: "🍳" },
  { value: "Business", label: "Business", icon: "💼" },
  { value: "Crafts", label: "Crafts", icon: "🔨" },
  { value: "Wellness", label: "Wellness", icon: "🧘" },
];

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
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSaved, setLocationSaved] = useState(hasLocation);

  useEffect(() => {
    const urlMiles = searchParams.get("miles");
    setMiles(urlMiles ? parseInt(urlMiles) : null);
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams(skill, type, miles, category);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  const updateParams = useCallback(
    (skillVal: string, typeVal: string, milesVal: number | null, categoryVal: string) => {
      const params = new URLSearchParams();
      if (skillVal) params.set("skill", skillVal);
      if (typeVal) params.set("type", typeVal);
      if (milesVal) params.set("miles", String(milesVal));
      if (categoryVal) params.set("category", categoryVal);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateParams(skill, newType, miles, category);
  };

  const handleMilesChange = (newMiles: number | null) => {
    setMiles(newMiles);
    updateParams(skill, type, newMiles, category);
  };

  const handleCategoryChange = (newCategory: string) => {
    const next = category === newCategory ? "" : newCategory;
    setCategory(next);
    updateParams(skill, type, miles, next);
    setCategoryOpen(false);
  };

  const handleClear = () => {
    setSkill("");
    setType("");
    setMiles(null);
    setCategory("");
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
      handleMilesChange(25);
    } catch {
      setLocationError("Location access denied or unavailable.");
    } finally {
      setLocationLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category);
  const advancedFilterCount = (type ? 1 : 0) + (miles ? 1 : 0);
  const activeFilterCount = (skill ? 1 : 0) + (category ? 1 : 0) + advancedFilterCount;

  return (
    <div className="sticky top-12 z-20 bg-[#0d0d0d] py-3 -mx-4 sm:-mx-5 px-4 sm:px-5 border-b border-[#252525]/60 animate-fade-up-2">
      <div className="space-y-2.5">
        {/* Row 1: Search + Category + Filters buttons */}
        <div className="flex gap-2">
          <div className="relative flex-1">
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
                onClick={() => { setSkill(""); updateParams("", type, miles, category); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#555] hover:text-[#e5e5e5] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category button */}
          <button
            onClick={() => { setCategoryOpen((v) => !v); setFiltersOpen(false); }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
              categoryOpen || category
                ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-400"
                : "bg-[#111111] border-[#252525] text-[#888] hover:border-cyan-500/30 hover:text-[#e5e5e5]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline max-w-[80px] truncate">
              {selectedCategory ? selectedCategory.label : "Category"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Filters button */}
          <button
            onClick={() => { setFiltersOpen((v) => !v); setCategoryOpen(false); }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
              filtersOpen || advancedFilterCount > 0
                ? "bg-cyan-600/10 border-cyan-500/40 text-cyan-400"
                : "bg-[#111111] border-[#252525] text-[#888] hover:border-cyan-500/30 hover:text-[#e5e5e5]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {advancedFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Category panel */}
        {categoryOpen && (
          <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-[#252525]/60">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? "bg-cyan-600/15 border border-cyan-500/40 text-cyan-400"
                    : "bg-[#181818] text-[#888] border border-[#252525] hover:border-cyan-500/30 hover:text-[#e5e5e5]"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="leading-none text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filters panel */}
        {filtersOpen && (
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#252525]/60">
            <div className="flex items-center gap-1.5">
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
            </div>

            <div className="w-px h-4 bg-[#252525] mx-1" />

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
                {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                {locationLoading ? "Locating…" : "Near me"}
              </button>
            )}

            {locationError && (
              <span className="text-[11px] text-red-400">{locationError}</span>
            )}
          </div>
        )}

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e5e5e5] transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
              <span className="w-4 h-4 rounded-full bg-cyan-600/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
