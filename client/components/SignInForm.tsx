"use client";

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Extract form values for validation
    const email = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Check for empty fields
    if (!email.trim() || !password.trim()) {
      toast.error("All fields are required.");
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    await refresh();
    toast.success("Logged in successfully!");
    const raw = searchParams.get("next") ?? "/";
    // Only redirect to safe relative paths to prevent open-redirect attacks
    const isSafeRelative = raw.startsWith("/") && !raw.startsWith("//");
    router.push(isSafeRelative ? raw : "/");
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
};

export default SignInForm;
