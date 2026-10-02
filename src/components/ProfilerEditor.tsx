"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PROFILER } from "@/src/lib/workbook-config";
import { hasScores, profilerSectionTotals } from "@/src/lib/formulas";
import { fmtDate } from "@/src/lib/format";
import { TIPS } from "@/src/lib/tooltips";
import { rotateProfilerAction, saveProfilerAction } from "@/app/actions";
import { InfoTip } from "./InfoTip";
import { SavedIndicator } from "./SavedIndicator";
import { useAutosave } from "./useAutosave";

interface SnapshotView {
  slot: number;
  analysisDate: string | null;
  scores: (number | null)[] | null;
  evidence?: string[] | null;
}

export function ProfilerEditor({ pursuitId, snapshots }: { pursuitId: string; snapshots: SnapshotView[] }) {
  const current = snapshots.find((s) => s.slot === 1);
  const prior = snapshots.find((s) => s.slot === 2);
  const priorPrior = snapshots.find((s) => s.slot === 3);

  const initial = {
    scores: [...(current?.scores ?? [])],
    evidence: [...(current?.evidence ?? [])],
  };
  while (initial.scores.length < 24) initial.scores.push(null);
  while (initial.evidence.length < 24) initial.evidence.push("");

  const { data, update, status } = useAutosave((d) => saveProfilerAction(pursuitId, d), initial, 400);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const sectionTotals = profilerSectionTotals(data.scores);
  const hasAnalysis = hasScores(current?.scores);

  function setScore(i: number, optionIdx: number | null) {
    update((prev) => {
      const scores = [...prev.scores];
      scores[i] = optionIdx === null ? null : PROFILER.scale[optionIdx].score;
      return { ...prev, scores };
    });
  }
  function setEvidence(i: number, value: string) {
    update((prev) => {
      const evidence = [...prev.evidence];
      evidence[i] = value;
      return { ...prev, evidence };
    });
  }

  let criterionIndex = 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Competitive Advantage Profile</h1>
          <p className="text-sm text-cf-muted">
            Current analysis: {fmtDate(current?.analysisDate ?? null)}
            {prior?.analysisDate ? ` · Prior: ${fmtDate(prior.analysisDate)}` : ""}
            {priorPrior?.analysisDate ? ` · ${fmtDate(priorPrior.analysisDate)}` : ""}
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-cf-muted">
            <InfoTip tip={TIPS.profilerScale} label="the scoring scale" />
            <span>{TIPS.profilerScale}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SavedIndicator status={status} />
          <button
            type="button"
            className="rounded-md bg-cf-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cf-orange-dark"
            onClick={() => setShowConfirm(true)}
          >
            {hasAnalysis ? "New analysis" : "Start first analysis"}
          </button>
        </div>
      </div>

      {!hasAnalysis && (
        <p className="rounded-md border border-cf-orange-light bg-cf-orange-light px-4 py-3 text-sm text-cf-ink">
          No analysis yet. Scoring below records against today; or press <strong>Start first analysis</strong>.
        </p>
      )}

      {PROFILER.sections.map((section, si) => (
        <section key={si} className="rounded-xl border border-cf-border bg-white">
          <header className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-cf-border bg-cf-canvas px-4 py-3">
            <h2 className="text-base font-semibold text-cf-ink">{section.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-cf-muted">
                Prior: <span className="font-semibold text-cf-blue">{profilerSectionTotals(prior?.scores ?? [])[si]}</span>
              </span>
              <span className="text-2xl font-bold text-cf-orange">
                {sectionTotals[si]}
                <span className="text-sm font-medium text-cf-muted"> / 20</span>
              </span>
            </div>
          </header>
          <ol className="divide-y divide-cf-border">
            <li className="hidden gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cf-muted md:grid md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1.2fr)]">
              <span>Criterion</span>
              <span>Your level of agreement</span>
              <span className="flex items-center gap-1.5">
                Supporting evidence
                <InfoTip tip={TIPS.evidence} label="supporting evidence" />
              </span>
            </li>
            {section.criteria.map((c) => {
              const i = criterionIndex++;
              const selected = data.scores[i] === null || data.scores[i] === undefined ? "" : String(PROFILER.scale.findIndex((o) => o.score === data.scores[i]));
              return (
                <li key={i} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1.2fr)] md:gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-cf-ink">
                      {i + 1}. {c.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-cf-muted">{c.consideration}</p>
                  </div>
                  <select
                    className="h-9 w-full self-start rounded-md border border-cf-border bg-white px-2.5 text-sm focus:border-cf-orange focus:outline-none"
                    value={selected}
                    onChange={(e) => setScore(i, e.target.value === "" ? null : Number(e.target.value))}
                    aria-label={`Score for ${c.title}`}
                  >
                    <option value="">— not scored</option>
                    {PROFILER.scale.map((o, oi) => (
                      <option key={oi} value={oi}>
                        {o.label} ({o.score > 0 ? `+${o.score}` : o.score})
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="min-h-16 w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none"
                    placeholder="What did the client say or do that supports this score?"
                    rows={3}
                    value={data.evidence[i] ?? ""}
                    onChange={(e) => setEvidence(i, e.target.value)}
                    aria-label={`Evidence for ${c.title}`}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cf-navy/60 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-cf-ink">Start a new analysis?</h2>
            <p className="mt-2 text-sm leading-6 text-cf-muted">
              {hasAnalysis
                ? "Your current evaluation is kept and becomes the prior one. The oldest of the last three evaluations is discarded. The new analysis is dated today."
                : "The first evaluation for this opportunity will be dated today."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-cf-border px-4 py-2 text-sm font-medium text-cf-ink hover:bg-cf-canvas"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-md bg-cf-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cf-orange-dark disabled:opacity-60"
                onClick={() =>
                  startTransition(async () => {
                    await rotateProfilerAction(pursuitId);
                    setShowConfirm(false);
                    router.refresh();
                  })
                }
              >
                {pending ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
