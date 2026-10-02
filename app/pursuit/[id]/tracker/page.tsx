import Link from "next/link";
import { notFound } from "next/navigation";
import { getPursuit, getProfilerSnapshots, getVulnerabilityActions } from "@/src/lib/db";
import { profilerSectionTotals } from "@/src/lib/formulas";
import { TrackerForm, type TrackerRow } from "@/src/components/TrackerForm";

export default async function TrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const [actions, snapshots] = await Promise.all([getVulnerabilityActions(id), getProfilerSnapshots(id)]);

  const currentTotals = profilerSectionTotals(snapshots.find((s) => s.slot === 1)?.scores ?? []);
  const priorTotals = profilerSectionTotals(snapshots.find((s) => s.slot === 2)?.scores ?? []);
  const currentTotal = currentTotals.reduce((a, b) => a + b, 0);
  const priorTotal = priorTotals.reduce((a, b) => a + b, 0);

  const rows: TrackerRow[] = actions.map((action) => ({
    category: action.category,
    priorScore: priorTotals[action.category - 1] ?? 0,
    currentScore: currentTotals[action.category - 1] ?? 0,
    action,
  }));

  return (
    <div className="flex flex-col gap-5">
      <TrackerForm pursuitId={id} rows={rows} priorTotal={priorTotal} currentTotal={currentTotal} />
      <p className="text-xs text-cf-muted">
        Prior and current scores come from the{" "}
        <Link href={`/pursuit/${id}/profiler`} className="font-medium text-cf-blue hover:underline">
          Competitive Profile
        </Link>{" "}
        (the last two evaluations). This mirrors the source tool: score the profile, then plan here.
      </p>
    </div>
  );
}
