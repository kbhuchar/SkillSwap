import Link from "next/link";
import { ArrowRight, Users, Calendar, Star, Zap, Shield, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SkillSwap</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-indigo-400 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-indigo-400 font-medium">
                How it works
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-200 hover:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-900/20"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-900/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-900/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-900/20 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-800/40">
            <Star className="w-3.5 h-3.5" />
            Join thousands of skill swappers worldwide
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Share Skills,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Grow Together
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with people who have the skills you want to learn, and share
            what you already know. No money needed — just mutual growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-900/40 text-lg group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333333] text-gray-200 font-semibold px-8 py-4 rounded-xl shadow-sm border border-[#333333] text-lg"
            >
              Browse Skills
            </Link>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  { bg: "bg-indigo-400", label: "A" },
                  { bg: "bg-purple-400", label: "B" },
                  { bg: "bg-pink-400", label: "C" },
                  { bg: "bg-blue-400", label: "D" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${item.bg} border-2 border-[#1a1a1a] flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              <span>2,500+ active members</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">4.9/5 from 800+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#242424]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to swap skills
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A platform built for learners and teachers — connecting people who
              want to grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                color: "bg-indigo-900/20 text-indigo-400",
                title: "Create Your Profile",
                description:
                  "List the skills you can teach and the skills you want to learn. Your profile is your marketplace listing.",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                color: "bg-purple-900/20 text-purple-400",
                title: "Find Perfect Matches",
                description:
                  "Our smart matching connects you with people whose skills complement yours for a perfect swap.",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                color: "bg-pink-900/20 text-pink-400",
                title: "Schedule Sessions",
                description:
                  "Book real-time sessions through our platform. Video, audio, or text — you choose how you swap.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-[#333333] bg-[#2a2a2a] hover:border-indigo-800/60 hover:shadow-lg hover:shadow-indigo-900/20 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How SkillSwap works
            </h2>
            <p className="text-lg text-gray-500">
              Get started in minutes. It&apos;s free and always will be.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Sign up for free", desc: "Create your account in under 2 minutes." },
              { step: "02", title: "Add your skills", desc: "List what you can teach and want to learn." },
              { step: "03", title: "Connect with matches", desc: "Browse and send connection requests." },
              { step: "04", title: "Start swapping", desc: "Schedule sessions and start learning." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/40">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#242424]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                color: "text-green-400 bg-green-900/20",
                title: "Safe & Secure",
                desc: "Your data is encrypted and protected. We never sell your information to third parties.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                color: "text-indigo-400 bg-indigo-900/20",
                title: "Community Driven",
                desc: "Built by learners, for learners. Our community guidelines ensure respectful interactions.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                color: "text-amber-400 bg-amber-900/20",
                title: "Always Free",
                desc: "SkillSwap is free to use. We believe knowledge sharing should be accessible to everyone.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl bg-[#2a2a2a] border border-[#333333]">
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start swapping?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of learners who are growing together every day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#242424] text-indigo-400 font-semibold px-8 py-4 rounded-xl shadow-lg text-lg"
          >
            Create your free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-[#111111] text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold">SkillSwap</span>
          </div>
          <p className="text-sm">
            © 2026 SkillSwap. Built with love for learners everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
