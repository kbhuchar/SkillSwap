"use client";

import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Zap,
  ChevronLeft,
  X,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Skill = { name: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const TEACH_SUGGESTIONS = [
  "JavaScript",
  "Python",
  "Design",
  "Guitar",
  "Cooking",
  "Spanish",
  "Photography",
  "React",
  "Writing",
  "Excel",
];

const LEARN_SUGGESTIONS = [
  "Public Speaking",
  "Piano",
  "Machine Learning",
  "Video Editing",
  "Marketing",
  "Drawing",
  "Yoga",
  "French",
  "Investing",
  "Leadership",
];

const CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "London",
  "Manchester",
  "Birmingham",
  "Edinburgh",
  "Toronto",
  "Vancouver",
  "Montreal",
  "Calgary",
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Auckland",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Singapore",
  "Dubai",
  "Abu Dhabi",
  "Riyadh",
  "Kuwait City",
  "Doha",
  "Paris",
  "Lyon",
  "Marseille",
  "Berlin",
  "Munich",
  "Hamburg",
  "Frankfurt",
  "Amsterdam",
  "Rotterdam",
  "Brussels",
  "Zurich",
  "Geneva",
  "Vienna",
  "Stockholm",
  "Oslo",
  "Copenhagen",
  "Helsinki",
  "Warsaw",
  "Prague",
  "Budapest",
  "Bucharest",
  "Athens",
  "Istanbul",
  "Ankara",
  "Cairo",
  "Lagos",
  "Nairobi",
  "Johannesburg",
  "Cape Town",
  "Casablanca",
  "São Paulo",
  "Rio de Janeiro",
  "Buenos Aires",
  "Bogotá",
  "Lima",
  "Santiago",
  "Mexico City",
  "Tokyo",
  "Osaka",
  "Seoul",
  "Beijing",
  "Shanghai",
  "Hong Kong",
  "Taipei",
  "Bangkok",
  "Jakarta",
  "Kuala Lumpur",
  "Manila",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDiceBearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

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

  const filtered =
    value.length >= 1
      ? CITIES.filter((c) =>
          c.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 6)
      : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const match = filtered[0];
            if (match) {
              onChange(match);
              setOpen(false);
            }
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="City"
        autoFocus
        className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-lg placeholder-gray-600 outline-none transition-colors text-center"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-[#2a2a2a] border border-[#444] rounded-2xl mt-1 overflow-hidden shadow-xl">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => {
                onChange(city);
                setOpen(false);
              }}
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
  skills,
  onAdd,
  onRemove,
  suggestions,
  color,
  placeholder,
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

  const addSkill = useCallback(
    (raw: string) => {
      const name = raw.trim();
      if (!name) return;
      if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase()))
        return;
      onAdd(name);
      setInput("");
      setResults([]);
      setOpen(false);
      inputRef.current?.focus();
    },
    [skills, onAdd]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/skills?q=${encodeURIComponent(input.trim())}`
        );
        const data: string[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        addSkill(results[0]);
      } else {
        addSkill(input);
      }
    }
    if (e.key === "Escape") setOpen(false);
  };

  const chipBase =
    color === "emerald"
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40";

  const suggestionBase =
    color === "emerald"
      ? "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
      : "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10";

  const unusedSuggestions = suggestions.filter(
    (s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim()) setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-lg placeholder-gray-600 outline-none transition-colors pr-12"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 size={18} className="animate-spin text-gray-400" />
          </div>
        )}
        {/* Dropdown */}
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

      {/* Added chips */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s.name}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${chipBase}`}
            >
              {s.name}
              <button
                type="button"
                onClick={() => onRemove(s.name)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Popular suggestions */}
      {unusedSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
            Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addSkill(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium bg-transparent transition-colors ${suggestionBase}`}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Sync name from session once it loads
  useEffect(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedName = name || session?.user?.name || "";

  // Generate avatar seeds from name
  const avatarSeeds = Array.from({ length: 6 }, (_, i) => {
    const base = resolvedName || "user";
    return `${base}-${i + 1}`;
  });

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(0, s - 1));
  const skip = () => setStep((s) => s + 1);

  const addOffered = (n: string) =>
    setSkillsOffered((prev) => [...prev, { name: n }]);
  const removeOffered = (n: string) =>
    setSkillsOffered((prev) => prev.filter((s) => s.name !== n));

  const addWanted = (n: string) =>
    setSkillsWanted((prev) => [...prev, { name: n }]);
  const removeWanted = (n: string) =>
    setSkillsWanted((prev) => prev.filter((s) => s.name !== n));

  // DOB validation: all 3 set and age >= 13
  const dobValid = (() => {
    if (!dobMonth || !dobDay || !dobYear) return false;
    const dob = new Date(
      parseInt(dobYear),
      parseInt(dobMonth) - 1,
      parseInt(dobDay)
    );
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    const realAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return realAge >= 13;
  })();

  // Image: selected avatar or valid-looking custom URL
  const effectiveImage = imageUrl.trim()
    ? imageUrl.trim()
    : image;
  const imageValid = !!effectiveImage;

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const dobIso =
        dobYear && dobMonth && dobDay
          ? new Date(
              parseInt(dobYear),
              parseInt(dobMonth) - 1,
              parseInt(dobDay)
            ).toISOString()
          : undefined;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resolvedName,
          dateOfBirth: dobIso,
          image: effectiveImage || undefined,
          location,
          bio,
          skillsOffered,
          skillsWanted,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStep(8); // done screen
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared step header ────────────────────────────────────────────────────
  const StepHeader = ({
    showBack = true,
    showSkip = false,
  }: {
    showBack?: boolean;
    showSkip?: boolean;
  }) => (
    <div className="flex items-center justify-between mb-8">
      <button
        type="button"
        onClick={goBack}
        className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors ${
          showBack ? "visible" : "invisible"
        }`}
      >
        <ChevronLeft size={22} />
      </button>
      <span className="text-sm text-gray-500">
        {step} / {TOTAL_STEPS}
      </span>
      {showSkip ? (
        <button
          type="button"
          onClick={skip}
          className="text-sm text-gray-500 hover:text-gray-300 px-2 py-1 transition-colors"
        >
          Skip
        </button>
      ) : (
        <span className="w-14" />
      )}
    </div>
  );

  // ── Step 0: Welcome ───────────────────────────────────────────────────────
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

  // ── Step 8: Done ──────────────────────────────────────────────────────────
  if (step === 8) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">
        <div className="animate-fade-up w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 mb-8 shadow-lg shadow-indigo-600/30">
            <Check size={44} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            You&apos;re all set, {resolvedName.split(" ")[0] || "there"}! 🎉
          </h1>
          <p className="text-gray-400 text-base mb-6 leading-relaxed">
            Your profile is ready. Start browsing skills and connecting with
            people.
          </p>
          {skillsOffered.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {skillsOffered.map((s) => (
                <span
                  key={s.name}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
          {skillsWanted.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {skillsWanted.map((s) => (
                <span
                  key={s.name}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Steps 1-7 ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 py-6">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto">
        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <>
            <StepHeader showBack={false} />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What&apos;s your name?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  This is how you&apos;ll appear to others
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-600 outline-none transition-colors text-center"
                  autoFocus
                  onKeyDown={(e) =>
                    e.key === "Enter" && resolvedName.trim() && goNext()
                  }
                />
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={!resolvedName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Date of Birth ── */}
        {step === 2 && (
          <>
            <StepHeader />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  When&apos;s your birthday?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  You must be 13 or older to use SkillSwap
                </p>
                <div className="flex gap-3">
                  {/* Month */}
                  <div className="relative flex-1">
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-full flex-1 bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-3 text-white text-base outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  {/* Day */}
                  <div className="relative flex-1">
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-full flex-1 bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-3 text-white text-base outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Day
                      </option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={String(d)}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  {/* Year */}
                  <div className="relative flex-1">
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-full flex-1 bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-3 text-white text-base outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {Array.from(
                        {
                          length:
                            new Date().getFullYear() - 13 - 1920 + 1,
                        },
                        (_, i) => new Date().getFullYear() - 13 - i
                      ).map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
                {dobMonth && dobDay && dobYear && !dobValid && (
                  <p className="text-red-400 text-sm mt-3 text-center">
                    You must be at least 13 years old.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={!dobValid}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Profile Photo ── */}
        {step === 3 && (
          <>
            <StepHeader />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  Add your photo
                </h2>
                <p className="text-sm text-gray-400 mb-6 text-center">
                  Pick an avatar to get started
                </p>

                {/* Avatar grid 3x2 */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {avatarSeeds.map((seed) => {
                    const url = getDiceBearUrl(seed);
                    const selected = image === url && !imageUrl.trim();
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => {
                          setImage(url);
                          setImageUrl("");
                        }}
                        className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          selected
                            ? "border-indigo-500 ring-4 ring-indigo-500/40"
                            : "border-[#333333] hover:border-[#555]"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Avatar ${seed}`}
                          className="w-full h-full object-cover bg-[#242424]"
                        />
                        {selected && (
                          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow">
                            <Check size={13} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Collapsible URL input */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput((v) => !v)}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors mb-3 text-center w-full flex items-center justify-center gap-1"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showUrlInput ? "rotate-180" : ""}`}
                  />
                  Use image URL instead
                </button>
                {showUrlInput && (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value.trim()) setImage("");
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-white text-base placeholder-gray-600 outline-none transition-colors"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={!imageValid}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 4: Location ── */}
        {step === 4 && (
          <>
            <StepHeader showSkip />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  Where are you based?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  Helps you connect with people nearby
                </p>
                <CityAutocompleteInput value={location} onChange={setLocation} />
              </div>
              <button
                type="button"
                onClick={goNext}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 5: Bio ── */}
        {step === 5 && (
          <>
            <StepHeader showSkip />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  Tell us about yourself
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  A short bio helps people decide to connect
                </p>
                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value.slice(0, 300))
                  }
                  placeholder="I'm a designer who loves teaching UI/UX and wants to learn guitar..."
                  rows={5}
                  className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-base text-white placeholder-gray-600 outline-none transition-colors resize-none leading-relaxed"
                  autoFocus
                />
                <p className="text-xs text-gray-600 mt-2 text-right">
                  {bio.length} / 300
                </p>
              </div>
              <button
                type="button"
                onClick={goNext}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 6: Skills Offered ── */}
        {step === 6 && (
          <>
            <StepHeader showSkip />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What can you teach?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  Add skills you can share with others
                </p>
                <SkillsAutocompleteInput
                  skills={skillsOffered}
                  onAdd={addOffered}
                  onRemove={removeOffered}
                  suggestions={TEACH_SUGGESTIONS}
                  color="emerald"
                  placeholder="e.g. JavaScript, Guitar..."
                />
              </div>
              <button
                type="button"
                onClick={goNext}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ── Step 7: Skills Wanted ── */}
        {step === 7 && (
          <>
            <StepHeader showSkip />
            <div className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What do you want to learn?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  We&apos;ll match you with people who teach these
                </p>
                <SkillsAutocompleteInput
                  skills={skillsWanted}
                  onAdd={addWanted}
                  onRemove={removeWanted}
                  suggestions={LEARN_SUGGESTIONS}
                  color="indigo"
                  placeholder="e.g. Piano, Marketing..."
                />
              </div>
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Finish →"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
