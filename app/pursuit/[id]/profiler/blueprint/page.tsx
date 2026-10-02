import Link from "next/link";
import { notFound } from "next/navigation";
import { getPursuit, getProfilerSnapshots } from "@/src/lib/db";
import { compTrafficLight, hasScores, profilerSectionTotals, pursuitScore } from "@/src/lib/formulas";
import { fmtDate } from "@/src/lib/format";
import { RadarChart } from "@/src/components/RadarChart";
import { TrafficLight } from "@/src/components/TrafficLight";
import { PROFILER } from "@/src/lib/workbook-config";

export default async function BlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pursuit = await getPursuit(id);
  if (!pursuit) notFound();
  const snapshots = await getProfilerSnapshots(id);

  // Only recorded evaluations draw: a snapshot needs answered scores, not
  // just a date. Empty (zero-score) snapshots are never shown.
  const series = snapshots
    .filter((s) => hasScores(s.scores))
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((s) => ({
      date: s.analysisDate,
      sectionTotals: profilerSectionTotals(s.scores ?? []),
    }));
  const current = series[0];
  const currentTotal = current ? current.sectionTotals.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Advantage Blueprint</h1>
          <p className="text-sm text-cf-muted">
            Competitive advantage across the six vulnerabilities, last three evaluations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TrafficLight light={compTrafficLight(currentTotal)} size="sm" />
          <Link
            href={`/pursuit/${id}/profiler`}
            className="rounded-md border border-cf-border bg-white px-4 py-2 text-sm font-medium text-cf-ink hover:bg-cf-canvas"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <RadarChart series={series} pursuitScorePct={current ? pursuitScore(currentTotal) : null} />
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-cf-border bg-white p-4">
            <h2 className="text-sm font-semibold text-cf-ink">Current evaluation</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {PROFILER.sections.map((s, i) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="text-cf-muted">{s.name}</span>
                  <span className={`font-semibold ${current && current.sectionTotals[i] >= 15 ? "text-light-green" : current && current.sectionTotals[i] >= 8 ? "text-cf-ink" : "text-light-red"}`}>
                    {current ? current.sectionTotals[i] : "—"}/20
                  </span>
                </li>
              ))}
            </ul>
            {current?.date && <p className="mt-3 border-t border-cf-border pt-2 text-xs text-cf-muted">Dated {fmtDate(current.date)}</p>}
          </div>
          <div className="rounded-xl border border-cf-border bg-white p-4 text-xs leading-5 text-cf-muted">
            <p className="font-semibold text-cf-ink">Scoring</p>
            <p className="mt-1.5">Each criterion: Don&apos;t Know 0 · Strongly Disagree +1 · Disagree +2 · Agree +4 · Strongly Agree +5.</p>
            <p className="mt-1">The Pursuit Score targets 80%+ before you commit to the pursuit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
