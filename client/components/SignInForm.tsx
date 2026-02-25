"use client";

import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignInForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Extract form values for validation
    const email = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Check for empty fields
    if (!email.trim() || !password.trim()) {
      toast.error(`All fields are required.`);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    //Check for non-200 status code
    if (!response.ok) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    // If login is successful, store the token and redirect
    const { access_token } = await response.json();
    console.log("Got token:", access_token); // Debug
    sessionStorage.setItem("token", access_token);
    console.log("Stored token:", sessionStorage.getItem("token")); // Verify
    toast.success("Logged in successfully!");
    router.push("/");
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
