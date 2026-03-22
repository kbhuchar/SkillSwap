import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a1a] px-4 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-800/60 transition-shadow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkillSwap</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Swap skills, grow together</p>
        </div>

        {/* Card */}
        <div className="bg-[#242424] rounded-2xl shadow-xl shadow-black/30 border border-[#333333] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
