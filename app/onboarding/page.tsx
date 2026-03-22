"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, ChevronLeft, Plus, X, Check, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Skill = { name: string };

// ─── Suggestion chips ────────────────────────────────────────────────────────

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

// ─── SkillChipInput ───────────────────────────────────────────────────────────

function SkillChipInput({
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
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    onAdd(name);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(input);
    }
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
    <div className="w-full space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-600 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => addSkill(input)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-4 flex items-center justify-center transition-colors"
        >
          <Plus size={22} />
        </button>
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

      {/* Suggestions */}
      {unusedSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Popular</p>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
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

const TOTAL_STEPS = 5; // steps 1–5 shown in progress bar

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(session?.user?.name ?? "");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Keep name in sync once session loads
  const resolvedName = name || session?.user?.name || "";

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(0, s - 1));
  const skip = () => setStep((s) => s + 1);

  const addOffered = (n: string) => setSkillsOffered((prev) => [...prev, { name: n }]);
  const removeOffered = (n: string) =>
    setSkillsOffered((prev) => prev.filter((s) => s.name !== n));

  const addWanted = (n: string) => setSkillsWanted((prev) => [...prev, { name: n }]);
  const removeWanted = (n: string) =>
    setSkillsWanted((prev) => prev.filter((s) => s.name !== n));

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resolvedName,
          location,
          bio,
          skillsOffered,
          skillsWanted,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStep(6); // done screen
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared header for steps 1-5 ──────────────────────────────────────────
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
        <div key={0} className="animate-fade-up w-full max-w-sm text-center">
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

  // ── Step 6: Done ──────────────────────────────────────────────────────────
  if (step === 6) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-6">
        <div key={6} className="animate-fade-up w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 mb-8 shadow-lg shadow-indigo-600/30">
            <Check size={44} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            You&apos;re all set, {resolvedName.split(" ")[0] || "there"}! 🎉
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Your profile is ready. Start browsing skills and connecting with people.
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

  // ── Steps 1-5 ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 py-6">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto">
        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <>
            <StepHeader showBack={false} />
            <div key={1} className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What&apos;s your name?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  This is how you&apos;ll appear to others
                </p>
                <input
                  type="text"
                  value={name || session?.user?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-600 outline-none transition-colors text-center"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && resolvedName.trim() && goNext()}
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

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <>
            <StepHeader showSkip />
            <div key={2} className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  Where are you based?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  Helps you connect with people nearby
                </p>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-600 outline-none transition-colors text-center"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
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

        {/* ── Step 3: Bio ── */}
        {step === 3 && (
          <>
            <StepHeader showSkip />
            <div key={3} className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  Tell us about yourself
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  A short bio helps people decide to connect
                </p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I'm a designer who loves teaching UI/UX and wants to learn guitar..."
                  rows={5}
                  className="w-full bg-[#242424] border-2 border-[#333333] focus:border-indigo-500 rounded-2xl py-4 px-5 text-base text-white placeholder-gray-600 outline-none transition-colors resize-none leading-relaxed"
                  autoFocus
                />
                <p className="text-xs text-gray-600 mt-2 text-right">{bio.length} / 300</p>
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

        {/* ── Step 4: Skills Offered ── */}
        {step === 4 && (
          <>
            <StepHeader showSkip />
            <div key={4} className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What can you teach?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  Add skills you can share with others
                </p>
                <SkillChipInput
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

        {/* ── Step 5: Skills Wanted ── */}
        {step === 5 && (
          <>
            <StepHeader showSkip />
            <div key={5} className="animate-fade-up flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                  What do you want to learn?
                </h2>
                <p className="text-sm text-gray-400 mb-8 text-center">
                  We&apos;ll match you with people who teach these
                </p>
                <SkillChipInput
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
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors mt-6 flex items-center justify-center gap-2"
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
