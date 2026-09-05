import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Kicker } from "@/components/ui/kicker";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <>
      <Kicker>Welcome back</Kicker>
      <h1>Sign in to Cue</h1>
      <LoginForm />
      <p className="text-mut-2 text-[13px]">
        New here? <Link href="/signup">Create an account</Link>.
      </p>
    </>
  );
}
