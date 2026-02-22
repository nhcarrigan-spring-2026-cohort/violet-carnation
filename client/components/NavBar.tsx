"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Navbar() {
  return (
    <div className="flex justify-end p-4">
      <ModeToggle />
    </div>
  );
}
