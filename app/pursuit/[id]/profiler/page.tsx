import { notFound } from "next/navigation";
import { getPursuit, getProfilerSnapshots } from "@/src/lib/db";
import { ProfilerEditor } from "@/src/components/ProfilerEditor";

export default async function ProfilerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const snapshots = await getProfilerSnapshots(id);
  const current = snapshots.find((s) => s.slot === 1);
  const prior = snapshots.find((s) => s.slot === 2);
  const priorPrior = snapshots.find((s) => s.slot === 3);

  return (
    <ProfilerEditor
      key={current?.analysisDate ?? "empty"}
      pursuitId={id}
      snapshots={[current, prior, priorPrior].filter(Boolean).map((s) => ({
        slot: s!.slot,
        analysisDate: s!.analysisDate,
        scores: s!.scores,
      }))}
    />
  );
}
