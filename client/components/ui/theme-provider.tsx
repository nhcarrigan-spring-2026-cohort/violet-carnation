<<<<<<< HEAD
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
=======
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
>>>>>>> d5f745185c33495821c4567fbc60ff8d0bdda30b

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
<<<<<<< HEAD
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
=======
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
>>>>>>> d5f745185c33495821c4567fbc60ff8d0bdda30b
