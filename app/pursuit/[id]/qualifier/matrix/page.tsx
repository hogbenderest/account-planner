import Link from "next/link";
import { notFound } from "next/navigation";
import { getPursuit, getQualSnapshots } from "@/src/lib/db";
import { canBand, hasScores, qualTotal, shouldBand } from "@/src/lib/formulas";
import { fmtDate } from "@/src/lib/format";
import { MatrixChart } from "@/src/components/MatrixChart";

export default async function QualificationMatrixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const snapshots = await getQualSnapshots(id);

  // Only recorded evaluations plot: a snapshot needs answered scores, not
  // just a date. Empty (zero-score) snapshots are never shown.
  const series = snapshots
    .filter((s) => hasScores(s.shouldScores) || hasScores(s.canScores))
    .sort((a, b) => a.slot - b.slot)
    .map((s) => ({
      date: s.analysisDate,
      should: qualTotal(s.shouldScores ?? []),
      can: qualTotal(s.canScores ?? []),
    }));

  const current = series.find((s) => s.date) ?? null;
  const shouldTotal = current ? current.should : 0;
  const canTotal = current ? current.can : 0;
  const hasAnalysis = current !== null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Qualification Matrix</h1>
          <p className="text-sm text-cf-muted">
            The last three evaluations, plotted. Right is easier to win; up is better business.
          </p>
        </div>
        <Link
          href={`/pursuit/${id}/qualifier`}
          className="rounded-md border border-cf-border bg-white px-4 py-2 text-sm font-medium text-cf-ink hover:bg-cf-canvas"
        >
          Edit qualification
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <MatrixChart series={series} />
        <div className="flex flex-col gap-3">
          {hasAnalysis ? (
            <div className="rounded-xl border border-cf-border bg-white p-4">
              <h2 className="text-sm font-semibold text-cf-ink">Current evaluation</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-cf-muted">Should We Sell</dt>
                  <dd className="text-lg font-bold text-cf-orange">
                    {shouldTotal > 0 ? `+${shouldTotal}` : shouldTotal}
                    <span className="ml-1.5 text-xs font-medium text-cf-muted">{shouldBand(shouldTotal) ?? ""}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-cf-muted">Can We Sell</dt>
                  <dd className="text-lg font-bold text-cf-orange">
                    {canTotal > 0 ? `+${canTotal}` : canTotal}
                    <span className="ml-1.5 text-xs font-medium text-cf-muted">{canBand(canTotal) ?? ""}</span>
                  </dd>
                </div>
                <div className="border-t border-cf-border pt-3 text-xs text-cf-muted">
                  Dated {fmtDate(current.date)}. Older evaluations fade to blue, then grey.
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-cf-border bg-white p-4 text-sm text-cf-muted">
              No evaluation yet. Score the Opportunity Qualification first.
            </div>
          )}
          <div className="rounded-xl border border-cf-border bg-white p-4 text-xs leading-5 text-cf-muted">
            <p className="font-semibold text-cf-ink">Bands</p>
            <p className="mt-1.5">Should We Sell: −11..−2 Undesirable · −1..+11 Acceptable · +12..+18 Premium</p>
            <p className="mt-1">Can We Sell: −18..−3 High difficulty · −2..+13 Medium · +14..+21 Low</p>
            <p className="mt-3 font-semibold text-cf-ink">The original methodology</p>
            <p className="mt-1.5">
              The source methodology mapped combined Should and Can scores onto five overall rankings: Premium Qualified,
              Qualified, Tentatively Qualified, Tentatively Disqualified, and Disqualified. This app shows the two band
              scales above instead; it does not compute the combined rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
