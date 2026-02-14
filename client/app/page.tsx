import { ModeToggle } from "@/components/ui/mode-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white p-6">
      <div className="flex justify-end">
        <ModeToggle />
      </div>

      <h1 className="mt-6 text-2xl font-bold">Theme Test</h1>
      <p>If background changes, dark mode works.</p>
    </main>
  )
}

