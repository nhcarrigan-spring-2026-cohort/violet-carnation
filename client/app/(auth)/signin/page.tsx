"use client"

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });
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
