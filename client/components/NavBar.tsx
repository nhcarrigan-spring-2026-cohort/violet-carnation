"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    logout();
    router.push("/signin");
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="font-semibold text-sm">
        VolunteerConnect
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/events" className="text-sm hover:underline">
          Events
        </Link>
        <Link href="/organizations" className="text-sm hover:underline">
          Organizations
        </Link>

        {user ? (
          <>
            <Link href="/profile" className="text-sm hover:underline">
              Profile
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm h-auto p-0 hover:underline font-normal"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/signin" className="text-sm hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm hover:underline">
              Sign Up
            </Link>
          </>
        )}

        <ModeToggle />
      </div>
    </nav>
  );
}
