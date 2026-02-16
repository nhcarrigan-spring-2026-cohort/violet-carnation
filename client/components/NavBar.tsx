"use client";
import React from "react";
import { ModeToggle } from "@/components/ui/mode-toggle"

export function Navbar() {
  return (
    <div className="flex justify-end p-4">
      <ModeToggle />
    </div>
  )
}


