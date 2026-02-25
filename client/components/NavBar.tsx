"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!sessionStorage.getItem("token");
    }
    return false;
  });

  const handleSignOut = () => {
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
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
        {isLoggedIn ? (
          <>
            <Link href="/profile">Profile</Link>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/signin">Sign In</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}
