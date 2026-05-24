import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — SkillSwap",
  description: "Sign in to your SkillSwap account",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to continue to SkillSwap</p>
      </div>
      <div className="bg-[#181818] rounded-2xl shadow-xl shadow-black/30 border border-[#252525] p-8">
        <LoginForm />
      </div>
    </>
  );
}
