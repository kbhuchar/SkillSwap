"use client";

import Link from "next/link";
import { ArrowRight, Users, Calendar, Zap, Globe } from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SplashScreen />

      <div
        className="min-h-screen flex flex-col bg-[#0d0d0d] transition-opacity duration-700"
        style={{ opacity: show ? 1 : 0 }}
      >
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#252525]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  Skill<span className="text-cyan-400">Swap</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-900/20 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col justify-center pt-20 sm:pt-12 px-5 sm:px-6 relative">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-cyan-900/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-900/30 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-950/20 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto w-full relative">
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-cyan-900/20 text-cyan-400 text-xs font-medium px-3 py-1 rounded-full border border-cyan-800/40">
                <Zap className="w-3 h-3" />
                Peer-to-peer skill sharing, for free
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Share Skills,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-400 to-pink-400">
                Grow Together
              </span>
            </h1>

            <p className="text-center text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-6 leading-relaxed">
              Connect with people who have the skills you want to learn, and
              share what you know. No money needed — just mutual growth.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center mb-12">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-900/40 group transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[
                {
                  icon: <Users className="w-3.5 h-3.5" />,
                  color: "bg-cyan-900/20 text-cyan-400",
                  border: "hover:border-cyan-800/60",
                  title: "Create Profile",
                  description: "List skills you teach and want to learn.",
                },
                {
                  icon: <Globe className="w-3.5 h-3.5" />,
                  color: "bg-cyan-900/20 text-cyan-400",
                  border: "hover:border-cyan-800/60",
                  title: "Find Matches",
                  description: "Connect with people whose skills complement yours.",
                },
                {
                  icon: <Calendar className="w-3.5 h-3.5" />,
                  color: "bg-pink-900/20 text-pink-400",
                  border: "hover:border-pink-800/60",
                  title: "Book Sessions",
                  description: "Schedule live sessions — video, audio, or text.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border border-[#252525] bg-[#181818]/80 backdrop-blur-sm ${feature.border} transition-all group`}
                >
                  <div className={`w-7 h-7 rounded-lg ${feature.color} flex items-center justify-center mb-2`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xs font-semibold text-white mb-1 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-snug hidden sm:block">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-3 px-4 border-t border-[#252525]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-cyan-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                Skill<span className="text-cyan-400">Swap</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              &copy; 2026 SkillSwap. Free for learners everywhere.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
