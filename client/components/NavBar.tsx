"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Navbar() {
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
        <Link href="/profile" className="text-sm hover:underline">
          Profile
        </Link>
        <Link href="/signin" className="text-sm hover:underline">
          Sign In
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          Sign Up
        </Link>
        <ModeToggle />
      </div>
    </nav>
  );
}
