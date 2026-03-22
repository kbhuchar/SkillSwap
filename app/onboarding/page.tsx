"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  ChevronLeft,
  X,
  Check,
  Loader2,
  ChevronDown,
  Camera,
  Plus,
  Search,
  Users,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Skill = { name: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const TEACH_SUGGESTIONS = [
  "JavaScript", "Python", "Design", "Guitar", "Cooking",
  "Spanish", "Photography", "React", "Writing", "Excel",
];

const LEARN_SUGGESTIONS = [
  "Public Speaking", "Piano", "Machine Learning", "Video Editing",
  "Marketing", "Drawing", "Yoga", "French", "Investing", "Leadership",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// 300+ major world cities — free-text is also allowed
const CITIES = [
  "Abu Dhabi","Accra","Addis Ababa","Adelaide","Ahmedabad","Alexandria",
  "Algiers","Almaty","Amman","Amsterdam","Ankara","Antananarivo",
  "Athens","Atlanta","Auckland","Austin","Baghdad","Baku","Baltimore",
  "Bangalore","Bangkok","Barcelona","Beijing","Beirut","Belgrade",
  "Berlin","Bogotá","Boston","Brisbane","Brussels","Bucharest",
  "Budapest","Buenos Aires","Cairo","Calgary","Canberra","Cape Town",
  "Casablanca","Charlotte","Chennai","Chicago","Chongqing","Colombo",
  "Columbus","Copenhagen","Dakar","Dallas","Damascus","Dar es Salaam",
  "Delhi","Denver","Detroit","Dhaka","Doha","Dubai","Dublin",
  "Durban","Edinburgh","Frankfurt","Geneva","Glasgow","Guadalajara",
  "Guangzhou","Guatemala City","Hamburg","Hanoi","Harare","Helsinki",
  "Ho Chi Minh City","Hong Kong","Honolulu","Houston","Hyderabad",
  "Indianapolis","Istanbul","Jakarta","Jeddah","Johannesburg",
  "Kabul","Karachi","Kathmandu","Khartoum","Kiev","Kinshasa",
  "Kolkata","Kuala Lumpur","Kuwait City","Lagos","Lahore","Las Vegas",
  "Lima","Lisbon","London","Los Angeles","Luanda","Lusaka","Lyon",
  "Madrid","Manila","Marseille","Medellín","Melbourne","Mexico City",
  "Miami","Milan","Minneapolis","Minsk","Montevideo","Montreal",
  "Moscow","Mumbai","Munich","Muscat","Nairobi","Nashville",
  "New York","Osaka","Oslo","Ottawa","Panama City","Paris",
  "Perth","Philadelphia","Phoenix","Port Elizabeth","Prague",
  "Pretoria","Pune","Pyongyang","Quito","Rabat","Riyadh",
  "Rio de Janeiro","Rome","Rotterdam","San Antonio","San Diego",
  "San Francisco","San Jose","Santiago","São Paulo","Seattle",
  "Seoul","Shanghai","Shenzhen","Singapore","Sofia","Stockholm",
  "Sydney","Taipei","Tashkent","Tehran","Tel Aviv","Tokyo","Toronto",
  "Tripoli","Tunis","Vancouver","Vienna","Warsaw","Washington DC",
  "Wuhan","Yangon","Yokohama","Zagreb","Zurich",
].sort();

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#2a2a2a] z-50">
      <div
        className="h-full bg-indigo-500 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── CityAutocompleteInput ────────────────────────────────────────────────────

function CityAutocompleteInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter cities — shows up to 8 matches; also allows any free-text value
  const filtered =
    value.trim().length >= 1
      ? CITIES.filter((c) =>
          c.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (filtered[0]) { onChange(filtered[0]); setOpen(false); }
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Type your city…"
        autoFocus
        className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-lg placeholder-gray-600 outline-none transition-colors"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-[#2a2a2a] border border-[#444] rounded-2xl mt-1 overflow-hidden shadow-xl">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => { onChange(city); setOpen(false); }}
              className="px-4 py-3 text-sm text-white hover:bg-indigo-600/20 cursor-pointer transition-colors"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── SkillsAutocompleteInput ──────────────────────────────────────────────────

function SkillsAutocompleteInput({
  skills, onAdd, onRemove, suggestions, color, placeholder,
}: {
  skills: Skill[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  suggestions: string[];
  color: "emerald" | "indigo";
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addSkill = useCallback((raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    onAdd(name);
    setInput(""); setResults([]); setOpen(false);
    inputRef.current?.focus();
  }, [skills, onAdd]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/skills?q=${encodeURIComponent(input.trim())}`);
        const data: string[] = await res.json();
        setResults(data); setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(results.length > 0 ? results[0] : input);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const chipCls = color === "emerald"
    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40";

  const suggCls = color === "emerald"
    ? "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    : "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10";

  const unused = suggestions.filter(
    (s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <div className="relative">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) setOpen(true); }}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-lg placeholder-gray-600 outline-none transition-colors pr-14"
        />
        {loading ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 size={18} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <button
            type="button"
            onMouseDown={() => addSkill(input)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-1.5 transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-10 w-full bg-[#2a2a2a] border border-[#444] rounded-2xl mt-1 overflow-hidden shadow-xl">
            {results.slice(0, 6).map((name) => (
              <li
                key={name}
                onMouseDown={() => addSkill(name)}
                className="px-4 py-3 text-sm text-white hover:bg-indigo-600/20 cursor-pointer transition-colors"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.name} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${chipCls}`}>
              {s.name}
              <button type="button" onClick={() => onRemove(s.name)} className="hover:opacity-70 transition-opacity">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {unused.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Popular</p>
          <div className="flex flex-wrap gap-2">
            {unused.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addSkill(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium bg-transparent transition-colors ${suggCls}`}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Image upload helper (client-side resize → base64) ───────────────────────

function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill name from session once it loads
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  }, [session?.user?.name]);

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const addOffered = (n: string) => setSkillsOffered((p) => [...p, { name: n }]);
  const removeOffered = (n: string) => setSkillsOffered((p) => p.filter((s) => s.name !== n));
  const addWanted = (n: string) => setSkillsWanted((p) => [...p, { name: n }]);
  const removeWanted = (n: string) => setSkillsWanted((p) => p.filter((s) => s.name !== n));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const base64 = await resizeToBase64(file);
      setImage(base64);
    } catch {
      alert("Failed to process image. Please try another file.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const dateOfBirth = `${dobYear}-${String(MONTHS.indexOf(dobMonth) + 1).padStart(2, "0")}-${String(parseInt(dobDay)).padStart(2, "0")}`;
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dateOfBirth, image, location, bio, skillsOffered, skillsWanted }),
      });
      if (!res.ok) throw new Error("Failed");
      setStep(8);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Validation per step ────────────────────────────────────────────────────
  const dobValid = (() => {
    if (!dobMonth || !dobDay || !dobYear) return false;
    const dob = new Date(parseInt(dobYear), MONTHS.indexOf(dobMonth), parseInt(dobDay));
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 13;
  })();

  const canContinue: Record<number, boolean> = {
    1: name.trim().length > 0,
    2: dobValid,
    3: image.trim().length > 0,
    4: location.trim().length > 0,
    5: bio.trim().length > 0,
    6: skillsOffered.length > 0,
    7: skillsWanted.length > 0,
  };

  // ── Shared step wrapper ────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // ── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">
        <div className="animate-fade-up w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 mb-8">
            <Zap size={38} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Hey {session?.user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Let&apos;s set up your SkillSwap profile. It only takes a minute.
          </p>
          <button
            type="button"
            onClick={goNext}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-colors"
          >
            Let&apos;s go →
          </button>
        </div>
      </div>
    );
  }

  // ── Step 8: Done / Hub ────────────────────────────────────────────────────
  if (step === 8) {
    const firstName = name.split(" ")[0];
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6 py-12">
        {/* Glow backdrop */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-3xl" />
        </div>

        <div className="animate-fade-up w-full max-w-sm relative">
          {/* Check + greeting */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600 mb-6 shadow-2xl shadow-indigo-600/40 ring-4 ring-indigo-500/20">
              <Check size={38} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              You&apos;re in, {firstName}! 🎉
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Where do you want to start?
            </p>
          </div>

          {/* 3 action cards */}
          <div className="flex flex-col gap-3">
            {/* Browse Skills */}
            <Link href="/browse" className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-purple-600/5 p-5 hover:border-indigo-500/50 hover:from-indigo-600/20 hover:to-purple-600/10 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/30 transition-colors">
                  <Search size={22} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white">Browse Skills</p>
                  <p className="text-xs text-gray-500 mt-0.5">Find people who match what you want to learn</p>
                </div>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>

            {/* Connections */}
            <Link href="/matches" className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-600/5 p-5 hover:border-emerald-500/50 hover:from-emerald-600/20 hover:to-teal-600/10 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600/30 transition-colors">
                  <Users size={22} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white">Connections</p>
                  <p className="text-xs text-gray-500 mt-0.5">See your matches and pending requests</p>
                </div>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>

            {/* Dashboard */}
            <Link href="/dashboard" className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-pink-600/5 p-5 hover:border-purple-500/50 hover:from-purple-600/20 hover:to-pink-600/10 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30 transition-colors">
                  <LayoutDashboard size={22} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white">Dashboard</p>
                  <p className="text-xs text-gray-500 mt-0.5">Your overview — sessions, stats and activity</p>
                </div>
                <ArrowRight size={18} className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1–7 ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 py-6">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <button
          type="button"
          onClick={goBack}
          className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors ${step === 1 ? "invisible" : ""}`}
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-sm text-gray-500">{step} / {TOTAL_STEPS}</span>
        <span className="w-9" />
      </div>

      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto">

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div key={1} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">What&apos;s your name?</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">This is how you&apos;ll appear to others</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && canContinue[1]) goNext(); }}
                className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-lg placeholder-gray-600 outline-none transition-colors text-center"
              />
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[1]}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Date of Birth ── */}
        {step === 2 && (
          <div key={2} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">When&apos;s your birthday?</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">You must be at least 13 years old</p>
              <div className="flex gap-3">
                {/* Month */}
                <div className="relative flex-[2]">
                  <select
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                    className="w-full appearance-none bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 pl-4 pr-8 text-white text-base outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                {/* Day */}
                <div className="relative flex-1">
                  <select
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className="w-full appearance-none bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 pl-4 pr-8 text-white text-base outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Day</option>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                {/* Year */}
                <div className="relative flex-[1.5]">
                  <select
                    value={dobYear}
                    onChange={(e) => setDobYear(e.target.value)}
                    className="w-full appearance-none bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 pl-4 pr-8 text-white text-base outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Year</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[2]}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 3: Profile Photo ── */}
        {step === 3 && (
          <div key={3} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Add your photo</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">A photo helps people recognise you</p>

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Profile preview"
                      className="w-40 h-40 rounded-full object-cover ring-4 ring-indigo-500 shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={28} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-[#242424] border-2 border-dashed border-[#444] flex flex-col items-center justify-center gap-2 group-hover:border-indigo-500 transition-colors">
                    {imageUploading ? (
                      <Loader2 size={28} className="animate-spin text-indigo-400" />
                    ) : (
                      <>
                        <Camera size={28} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors">Upload photo</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {image && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Change photo
                </button>
              )}
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[3] || imageUploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 4: Location ── */}
        {step === 4 && (
          <div key={4} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Where are you based?</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">Helps you connect with people nearby</p>
              <CityAutocompleteInput value={location} onChange={setLocation} />
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[4]}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 5: Bio ── */}
        {step === 5 && (
          <div key={5} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Tell us about yourself</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">A short bio helps people decide to connect</p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="I'm a designer who loves teaching UI/UX and wants to learn guitar…"
                rows={5}
                autoFocus
                className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-base placeholder-gray-600 outline-none transition-colors resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-600 mt-2 text-right">{bio.length} / 300</p>
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[5]}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 6: Skills to Teach ── */}
        {step === 6 && (
          <div key={6} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">What can you teach?</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">Add at least one skill you can share</p>
              <SkillsAutocompleteInput
                skills={skillsOffered}
                onAdd={addOffered}
                onRemove={removeOffered}
                suggestions={TEACH_SUGGESTIONS}
                color="emerald"
                placeholder="e.g. JavaScript, Guitar…"
              />
            </div>
            <button type="button" onClick={goNext} disabled={!canContinue[6]}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 7: Skills to Learn ── */}
        {step === 7 && (
          <div key={7} className="animate-fade-up flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">What do you want to learn?</h2>
              <p className="text-sm text-gray-400 mb-8 text-center">Add at least one skill you&apos;re looking to pick up</p>
              <SkillsAutocompleteInput
                skills={skillsWanted}
                onAdd={addWanted}
                onRemove={removeWanted}
                suggestions={LEARN_SUGGESTIONS}
                color="indigo"
                placeholder="e.g. Piano, Marketing…"
              />
            </div>
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canContinue[7] || submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Saving…</> : "Finish →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
