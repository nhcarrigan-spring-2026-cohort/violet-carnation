"use client";

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
  };

  return (
    // Logo 
    <AuthCard
      title="Sign Up"
      buttonText="Sign Up"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/signin"
      onSubmit={handleSubmit}
    >
      <Label htmlFor="first_name">First Name</Label>
      <Input id="first_name" name="first_name" />
      <Label htmlFor="last_name">Last Name</Label>
      <Input id="last_name" name="last_name" />
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" type="email" />
      <Label htmlFor="password">Password</Label>
      <Input id="password" name="password" type="password" />
    </AuthCard>
  );
}
