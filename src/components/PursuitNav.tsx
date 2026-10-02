"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PursuitNav({ pursuitId }: { pursuitId: string }) {
  const pathname = usePathname();
  const base = `/pursuit/${pursuitId}`;
  const items = [
    { href: base, label: "Account Information", exact: true },
    { href: `${base}/qualifier`, label: "Opportunity Qualification", exact: true },
    { href: `${base}/qualifier/matrix`, label: "Qualification Matrix" },
    { href: `${base}/profiler`, label: "Competitive Profile", exact: true },
    { href: `${base}/profiler/blueprint`, label: "Advantage Blueprint" },
    { href: `${base}/tracker`, label: "Pursuit Tracker" },
    { href: `${base}/planner`, label: "Action Planner" },
    { href: `${base}/help`, label: "Help", exact: true },
  ];
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Pursuit">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active
                ? "border-l-4 border-cf-orange pl-2 font-semibold text-cf-orange"
                : "text-cf-orange/90 hover:bg-cf-navy-hover hover:text-cf-orange"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-2 rounded-md px-3 py-2 text-sm font-medium text-cf-orange/90 hover:bg-cf-navy-hover hover:text-cf-orange"
      >
        ← All accounts
      </Link>
    </nav>
  );
}
