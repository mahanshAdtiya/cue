import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <>
      <span className="text-mini font-mono uppercase tracking-[.16em] text-gold">
        Welcome back
      </span>
      <h1>Sign in to Cue</h1>
      <LoginForm />
      <p className="text-mut-2 text-[13px]">
        New here? <Link href="/signup">Create an account</Link>.
      </p>
    </>
  );
}
