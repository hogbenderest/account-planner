"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QUALIFIER, type QualifierSection } from "@/src/lib/workbook-config";
import { canBand, hasScores, qualTotal, shouldBand } from "@/src/lib/formulas";
import { fmtDate } from "@/src/lib/format";
import { TIPS } from "@/src/lib/tooltips";
import { rotateQualAction, saveQualAction } from "@/app/actions";
import { InfoTip } from "./InfoTip";
import { SavedIndicator } from "./SavedIndicator";
import { useAutosave } from "./useAutosave";

interface SnapshotView {
  slot: number;
  analysisDate: string | null;
  shouldScores: (number | null)[] | null;
  canScores: (number | null)[] | null;
  shouldEvidence?: string[] | null;
  canEvidence?: string[] | null;
}

function optionIndexFor(q: { options: { score: number }[] }, score: number | null | undefined): string {
  if (score === null || score === undefined) return "";
  const idx = q.options.findIndex((o) => o.score === score);
  return idx === -1 ? "" : String(idx);
}

export function QualifierEditor({ pursuitId, snapshots }: { pursuitId: string; snapshots: SnapshotView[] }) {
  const current = snapshots.find((s) => s.slot === 1);
  const prior = snapshots.find((s) => s.slot === 2);
  const priorPrior = snapshots.find((s) => s.slot === 3);

  const initial = {
    shouldScores: [...(current?.shouldScores ?? [])],
    shouldEvidence: [...(current?.shouldEvidence ?? [])],
    canScores: [...(current?.canScores ?? [])],
    canEvidence: [...(current?.canEvidence ?? [])],
  };
  while (initial.shouldScores.length < 7) initial.shouldScores.push(null);
  while (initial.canScores.length < 7) initial.canScores.push(null);
  while (initial.shouldEvidence.length < 7) initial.shouldEvidence.push("");
  while (initial.canEvidence.length < 7) initial.canEvidence.push("");

  const { data, update, status } = useAutosave(
    (d) => saveQualAction(pursuitId, d),
    initial,
    400,
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const shouldTotal = qualTotal(data.shouldScores);
  const canTotal = qualTotal(data.canScores);
  const hasAnalysis = hasScores(current?.shouldScores) || hasScores(current?.canScores);

  function Section({ section, kind }: { section: QualifierSection; kind: "should" | "can" }) {
    const scores = kind === "should" ? data.shouldScores : data.canScores;
    const evidence = kind === "should" ? data.shouldEvidence : data.canEvidence;
    const setScore = (i: number, optionIdx: number | null) =>
      update((prev) => {
        const next = { ...prev, [kind === "should" ? "shouldScores" : "canScores"]: [...scores] } as typeof prev;
        const arr = (kind === "should" ? next.shouldScores : next.canScores) as (number | null)[];
        arr[i] = optionIdx === null ? null : section.questions[i].options[optionIdx].score;
        return next;
      });
    const setEvidence = (i: number, value: string) =>
      update((prev) => {
        const key = kind === "should" ? "shouldEvidence" : "canEvidence";
        const arr = [...(prev[key] as string[])];
        arr[i] = value;
        return { ...prev, [key]: arr };
      });
    const total = kind === "should" ? shouldTotal : canTotal;
    const band = kind === "should" ? shouldBand(total) : canBand(total);
    const priorTotal = qualTotal((kind === "should" ? prior?.shouldScores : prior?.canScores) ?? []);
    const priorPriorTotal = qualTotal((kind === "should" ? priorPrior?.shouldScores : priorPrior?.canScores) ?? []);

    return (
      <section className="rounded-xl border border-cf-border bg-white">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-cf-border bg-cf-canvas px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-cf-ink">{section.title}</h2>
            <p className="text-xs text-cf-muted">
              {section.bands.map((b) => `${b.min} to ${b.max} = ${b.label}`).join("  |  ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-cf-orange">{total}</div>
              <div className="text-xs font-medium text-cf-muted">{band ?? "No band"}</div>
            </div>
            <HistoryChips prior={priorTotal} priorPrior={priorPriorTotal} />
          </div>
        </header>
        <ol className="divide-y divide-cf-border">
          <li className="hidden gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cf-muted md:grid md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1.2fr)]">
            <span>Question</span>
            <span>Score</span>
            <span className="flex items-center gap-1.5">
              Supporting evidence
              <InfoTip tip={TIPS.evidence} label="supporting evidence" />
            </span>
          </li>
          {section.questions.map((q, i) => (
            <li key={i} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1.2fr)] md:gap-4">
              <div>
                <h3 className="text-sm font-semibold text-cf-ink">
                  {i + 1}. {q.title}
                </h3>
                {q.guidance.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5 text-cf-muted">
                    {q.guidance.map((g, gi) => (
                      <li key={gi}>{g}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <select
                  className="w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none"
                  value={optionIndexFor(q, scores[i])}
                  onChange={(e) =>
                    setScore(i, e.target.value === "" || q.options[Number(e.target.value)] === undefined ? null : Number(e.target.value))
                  }
                  aria-label={`Score for ${q.title}`}
                >
                  <option value="">— not scored</option>
                  {q.options.map((o, oi) => (
                    <option key={oi} value={oi}>
                      {o.label} ({o.score > 0 ? `+${o.score}` : o.score})
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="min-h-16 w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none"
                placeholder="What did the client say or do that supports this score?"
                rows={3}
                value={evidence[i] ?? ""}
                onChange={(e) => setEvidence(i, e.target.value)}
                aria-label={`Evidence for ${q.title}`}
              />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Opportunity Qualification</h1>
          <p className="text-sm text-cf-muted">
            Current analysis: {fmtDate(current?.analysisDate ?? null)}
            {prior?.analysisDate ? ` · Prior: ${fmtDate(prior.analysisDate)}` : ""}
            {priorPrior?.analysisDate ? ` · ${fmtDate(priorPrior.analysisDate)}` : ""}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-cf-muted">
            <InfoTip tip={TIPS.qualifierTiming} label="when to use this tool" />
            {TIPS.qualifierTiming}
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

      <Section section={QUALIFIER.shouldWeSell} kind="should" />
      <Section section={QUALIFIER.canWeSell} kind="can" />

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
                    await rotateQualAction(pursuitId);
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

function HistoryChips({ prior, priorPrior }: { prior: number; priorPrior: number }) {
  return (
    <div className="flex flex-col items-end gap-1 text-xs text-cf-muted">
      <span title="Prior evaluation total">
        Prior: <span className="font-semibold text-cf-blue">{prior}</span>
      </span>
      <span title="Evaluation before that">
        Earlier: <span className="font-semibold text-cf-muted">{priorPrior}</span>
      </span>
    </div>
  );
}
