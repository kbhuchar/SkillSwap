import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — SkillSwap",
  description: "Sign in to your SkillSwap account",
};

export default function LoginPage() {
  return <LoginForm />;
}
