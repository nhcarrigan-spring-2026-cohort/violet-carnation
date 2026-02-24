"use client";

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (response.ok) {
      await refresh();
      const raw = searchParams.get("next") ?? "/";
      // Only redirect to safe relative paths to prevent open-redirect attacks
      const isSafeRelative = raw.startsWith("/") && !raw.startsWith("//");
      const next = isSafeRelative ? raw : "/";
      router.push(next);
    }
  };

  return (
    <AuthCard
      title="Sign In"
      buttonText="Login"
      footerText="Don't have an account?"
      footerLinkText="Sign up now"
      footerLinkHref="/signup"
      onSubmit={handleSubmit}
    >
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="username" type="email" />
      <Label htmlFor="password">Password</Label>
      <Input id="password" name="password" type="password" />
    </AuthCard>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
