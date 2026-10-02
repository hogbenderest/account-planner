import { notFound } from "next/navigation";
import { getPursuit, getQualSnapshots } from "@/src/lib/db";
import { QualifierEditor } from "@/src/components/QualifierEditor";

export default async function QualifierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const snapshots = await getQualSnapshots(id);
  const current = snapshots.find((s) => s.slot === 1);
  const prior = snapshots.find((s) => s.slot === 2);
  const priorPrior = snapshots.find((s) => s.slot === 3);

  return (
    <QualifierEditor
      key={current?.analysisDate ?? "empty"}
      pursuitId={id}
      snapshots={[current, prior, priorPrior].filter(Boolean).map((s) => ({
        slot: s!.slot,
        analysisDate: s!.analysisDate,
        shouldScores: s!.shouldScores,
        shouldEvidence: s!.shouldEvidence,
        canScores: s!.canScores,
        canEvidence: s!.canEvidence,
      }))}
    />
  );
}
