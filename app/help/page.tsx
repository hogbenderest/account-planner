import Link from "next/link";
import { HelpContent } from "@/src/components/HelpContent";

export const metadata = { title: "Help - Account Planner" };

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-cf-canvas">
      <header className="bg-cf-navy px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cf-orange text-base font-black text-white">A</span>
            <span className="text-sm font-bold text-white">Account Planner</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
            ← All accounts
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <HelpContent />
      </main>
    </div>
  );
}
