import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import { Kicker } from "@/components/ui/kicker";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function SignupPage() {
  return (
    <>
      <Kicker>Create your account</Kicker>
      <h1>Start your library</h1>
      <SignupForm />
      <p className="text-mut-2 text-[13px]">
        Already have an account? <Link href="/signin">Sign in</Link>.
      </p>
    </>
  );
}
