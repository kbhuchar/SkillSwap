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
        className="min-h-screen flex flex-col bg-[#1a1a1a] transition-opacity duration-700"
        style={{ opacity: show ? 1 : 0 }}
      >
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#333333]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  Skill<span className="text-indigo-400">Swap</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-900/20 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
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
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-900/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-900/30 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-950/20 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto w-full relative">
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-1.5 bg-indigo-900/20 text-indigo-400 text-xs font-medium px-3 py-1 rounded-full border border-indigo-800/40">
                <Zap className="w-3 h-3" />
                Peer-to-peer skill sharing, for free
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Share Skills,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Grow Together
              </span>
            </h1>

            <p className="text-center text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-6 leading-relaxed">
              Connect with people who have the skills you want to learn, and
              share what you know. No money needed — just mutual growth.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 group transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/browse"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 font-semibold px-6 py-2.5 rounded-xl border border-[#333333] hover:border-indigo-800/60 transition-all"
              >
                Browse Skills
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: <Users className="w-4 h-4" />,
                  color: "bg-indigo-900/20 text-indigo-400",
                  border: "hover:border-indigo-800/60",
                  title: "Create Your Profile",
                  description:
                    "List the skills you can teach and the ones you want to learn.",
                },
                {
                  icon: <Globe className="w-4 h-4" />,
                  color: "bg-purple-900/20 text-purple-400",
                  border: "hover:border-purple-800/60",
                  title: "Find Perfect Matches",
                  description:
                    "Smart matching connects you with people whose skills complement yours.",
                },
                {
                  icon: <Calendar className="w-4 h-4" />,
                  color: "bg-pink-900/20 text-pink-400",
                  border: "hover:border-pink-800/60",
                  title: "Schedule Sessions",
                  description:
                    "Book live sessions — video, audio, or text. You choose.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border border-[#333333] bg-[#242424]/80 backdrop-blur-sm ${feature.border} hover:shadow-lg hover:shadow-indigo-900/10 transition-all group`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-3 px-4 border-t border-[#333333]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                Skill<span className="text-indigo-400">Swap</span>
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
