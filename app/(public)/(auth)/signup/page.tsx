import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create your account",
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <>
      <span className="text-mini font-mono uppercase tracking-[.16em] text-gold">
        Create your account
      </span>
      <h1>Start your library</h1>
      <SignupForm />
      <p className="text-mut-2 text-[13px]">
        Already have an account? <Link href="/signin">Sign in</Link>.
      </p>
    </>
  );
}
