import type { Config } from "tailwindcss"

const config = {
<<<<<<< HEAD
  darkMode: ["class"],
=======
  darkMode: "selector",
>>>>>>> d5f745185c33495821c4567fbc60ff8d0bdda30b
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config

export default config
