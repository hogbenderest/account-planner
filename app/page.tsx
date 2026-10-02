import Link from "next/link";
import { listPursuitSummaries } from "@/src/lib/db";
import { compTrafficLight, pursuitScore, qualTrafficLight } from "@/src/lib/formulas";
import { fmtAud, fmtDate, fmtDateTime, fmtPct } from "@/src/lib/format";
import { TrafficLight } from "@/src/components/TrafficLight";
import { NewAccountButton } from "@/src/components/NewAccountButton";

export default async function AccountList() {
  const summaries = await listPursuitSummaries();

  return (
    <div className="min-h-screen bg-cf-canvas">
      <header className="bg-cf-navy px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cf-orange text-lg font-black text-white">A</span>
            <div>
              <h1 className="text-lg font-bold text-white">Account Planner</h1>
              <p className="text-xs text-white/60">Qualify opportunities. Build competitive advantage.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/help" className="text-sm font-medium text-white/70 hover:text-white">
              Help
            </Link>
            <NewAccountButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {summaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cf-border bg-white px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-cf-ink">No accounts yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-cf-muted">
              Create your first account to start qualifying opportunities and profiling competitive advantage.
            </p>
            <div className="mt-6">
              <NewAccountButton />
            </div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map(({ pursuit, qualShould, qualCan, profilerTotal }) => {
              const score = pursuitScore(profilerTotal);
              return (
                <li key={pursuit.id}>
                  <Link
                    href={`/pursuit/${pursuit.id}`}
                    className="flex h-full flex-col gap-3 rounded-xl border border-cf-border bg-white p-5 transition hover:border-cf-orange hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-cf-ink">{pursuit.accountName || "Untitled account"}</h2>
                        <p className="text-xs text-cf-muted">
                          {pursuit.phase ? `Phase: ${pursuit.phase}` : "No phase set"}
                          {pursuit.proposedOffering ? ` · ${pursuit.proposedOffering}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-cf-orange-light px-2.5 py-1 text-sm font-bold text-cf-orange">
                        {fmtPct(score)}
                      </span>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-cf-muted">
                      <div>
                        <dt className="inline">Deal size: </dt>
                        <dd className="inline font-medium text-cf-ink">{fmtAud(pursuit.dealSize)}</dd>
                      </div>
                      <div>
                        <dt className="inline">Close: </dt>
                        <dd className="inline font-medium text-cf-ink">{fmtDate(pursuit.closeDate)}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                      <TrafficLight light={qualTrafficLight(qualShould, qualCan)} size="sm" />
                      <TrafficLight light={compTrafficLight(profilerTotal)} size="sm" />
                    </div>
                    <p className="text-[11px] text-cf-muted">Updated {fmtDateTime(pursuit.updatedAt)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
