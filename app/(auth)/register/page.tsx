import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — SkillSwap",
  description: "Create your SkillSwap account and start swapping skills",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
