"use client";

import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { EVENT_CATEGORIES, EventCategory } from "@/models/eventCategories";

export default function SignUpPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<EventCategory[]>([]);

  const handleInterestToggle = (category: EventCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: formData.get("first_name") ?? "",
        last_name: formData.get("last_name") ?? "",
        email: formData.get("email") ?? "",
        password: formData.get("password") ?? "",
        skills: formData.get("skills") ?? "",
        interests: selectedInterests,
      }),
    });

    if (response.ok) {
      router.push("/");
    }
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
      <Label htmlFor="skills">Skills</Label>
      <Input
        id="skills"
        name="skills"
        placeholder="e.g. First Aid, Teaching, Driving"
      />
      <div className="space-y-2">
        <Label>Interests</Label>
        <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
          {EVENT_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`interest-${category}`}
                checked={selectedInterests.includes(category)}
                onCheckedChange={() => handleInterestToggle(category)}
              />
              <Label
                htmlFor={`interest-${category}`}
                className="cursor-pointer text-sm font-normal"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </AuthCard>
  );
}
