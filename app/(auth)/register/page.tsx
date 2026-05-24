import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — SkillSwap",
  description: "Create your SkillSwap account and start swapping skills",
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Join SkillSwap and start learning today</p>
      </div>
      <div className="bg-[#181818] rounded-2xl shadow-xl shadow-black/30 border border-[#252525] p-8">
        <RegisterForm />
      </div>
    </>
  );
}
