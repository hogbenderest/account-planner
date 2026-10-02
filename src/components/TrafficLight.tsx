import type { Light } from "@/src/lib/formulas";

const COLORS: Record<Light, string> = {
  green: "bg-light-green",
  amber: "bg-light-amber",
  red: "bg-light-red",
};

const LABELS: Record<Light, string> = {
  green: "On track",
  amber: "At risk",
  red: "Needs attention",
};

export function TrafficLight({ light, label = true, size = "md" }: { light: Light; label?: boolean; size?: "sm" | "md" }) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const text = size === "sm" ? "text-xs" : "text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-cf-border bg-white px-2.5 py-1 ${text} font-medium text-cf-ink`}
      title={LABELS[light]}
    >
      <span className={`${dot} rounded-full ${COLORS[light]}`} aria-hidden />
      {label ? LABELS[light] : <span className="sr-only">{LABELS[light]}</span>}
    </span>
  );
}
