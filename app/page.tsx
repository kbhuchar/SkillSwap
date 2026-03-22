import Link from "next/link";
import { ArrowRight, Users, Calendar, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#333333]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">SkillSwap</span>
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

      {/* Hero Section — single viewport */}
      <section className="flex-1 flex flex-col justify-center pt-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-indigo-900/25 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-purple-900/25 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto w-full relative">
          {/* Hero content */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 bg-indigo-900/20 text-indigo-400 text-xs font-medium px-3 py-1 rounded-full mb-4 border border-indigo-800/40">
              <Zap className="w-3 h-3" />
              2,500+ active members worldwide
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Share Skills,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Grow Together
              </span>
            </h1>
            <p className="text-base text-gray-400 max-w-xl mx-auto mb-6 leading-relaxed">
              Connect with people who have the skills you want to learn, and share
              what you already know. No money needed — just mutual growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-900/40 group transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333333] text-gray-200 font-semibold px-6 py-2.5 rounded-xl border border-[#333333] transition-colors"
              >
                Browse Skills
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: <Users className="w-4 h-4" />,
                color: "bg-indigo-900/20 text-indigo-400",
                title: "Create Your Profile",
                description:
                  "List the skills you can teach and the skills you want to learn.",
              },
              {
                icon: <Globe className="w-4 h-4" />,
                color: "bg-purple-900/20 text-purple-400",
                title: "Find Perfect Matches",
                description:
                  "Smart matching connects you with people whose skills complement yours.",
              },
              {
                icon: <Calendar className="w-4 h-4" />,
                color: "bg-pink-900/20 text-pink-400",
                title: "Schedule Sessions",
                description:
                  "Book real-time sessions — video, audio, or text. You choose.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#333333] bg-[#242424] hover:border-indigo-800/60 hover:shadow-lg hover:shadow-indigo-900/20 transition-all"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${feature.color} flex items-center justify-center mb-3`}
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
      <footer className="py-3 px-4 border-t border-[#333333] bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">SkillSwap</span>
          </div>
          <p className="text-xs text-gray-500">
            &copy; 2026 SkillSwap. Free for learners everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
