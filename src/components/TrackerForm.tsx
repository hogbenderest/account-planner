"use client";

import { VULNERABILITY_CATEGORIES } from "@/src/lib/workbook-config";
import { pursuitScore } from "@/src/lib/formulas";
import { fmtDate, fmtPct } from "@/src/lib/format";
import { STATUS_OPTIONS, TIPS } from "@/src/lib/tooltips";
import { saveVulnerabilityActionAction } from "@/app/actions";
import type { VulnerabilityAction } from "@/src/lib/db";
import { InfoTip } from "./InfoTip";
import { SavedIndicator } from "./SavedIndicator";
import { useAutosave } from "./useAutosave";

const FIELD = "w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none";

/** Option list for the status select; keeps any pre-existing custom value visible and selectable. */
function statusOptions(value: string): string[] {
  return STATUS_OPTIONS.includes(value) ? STATUS_OPTIONS : [...STATUS_OPTIONS, value];
}

export interface TrackerRow {
  category: number;
  priorScore: number;
  currentScore: number;
  action: VulnerabilityAction;
}

/**
 * Pursuit Tracker: six vulnerability rows. Prior/current scores are pulled
 * from the profile's snapshots (prior = slot 2, current = slot 1), exactly
 * as the source workbook formulas did; the remaining columns are free text.
 */
export function TrackerForm({ pursuitId, rows, priorTotal, currentTotal }: { pursuitId: string; rows: TrackerRow[]; priorTotal: number; currentTotal: number }) {
  const { data, update, status } = useAutosave(
    (d) => Promise.all(d.map((r) => saveVulnerabilityActionAction(pursuitId, r.category, r.patch))).then(() => undefined),
    rows.map((r) => ({
      category: r.category,
      patch: {
        currentState: r.action.currentState,
        desiredState: r.action.desiredState,
        agreedActions: r.action.agreedActions,
        owner: r.action.owner,
        targetDate: r.action.targetDate,
        status: r.action.status,
      },
    })),
    500,
  );

  const setField = (category: number, key: string, value: string | null) =>
    update((prev) => prev.map((r) => (r.category === category ? { ...r, patch: { ...r.patch, [key]: value } } : r)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Pursuit Tracker</h1>
          <p className="text-sm text-cf-muted">Track the six potential sales vulnerabilities and your agreed actions.</p>
        </div>
        <SavedIndicator status={status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreCard title="Prior Pursuit Score" total={priorTotal} tone="muted" />
        <ScoreCard title="Current Pursuit Score" total={currentTotal} tone="orange" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-cf-border bg-white">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cf-border bg-cf-canvas text-left text-xs font-semibold uppercase tracking-wide text-cf-muted">
              <th className="px-3 py-2.5">Vulnerability</th>
              <th className="px-3 py-2.5">Prior</th>
              <th className="px-3 py-2.5">Current</th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Current state <InfoTip tip={TIPS.currentState} label="current state" /></span>
              </th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Desired state <InfoTip tip={TIPS.desiredState} label="desired state" /></span>
              </th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Agreed actions <InfoTip tip={TIPS.agreedActions} label="agreed actions" /></span>
              </th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Owner <InfoTip tip={TIPS.trackerOwner} label="owner" /></span>
              </th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Target date <InfoTip tip={TIPS.targetDate} label="target date" /></span>
              </th>
              <th className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5">Results / status <InfoTip tip={TIPS.trackerStatus} label="results and status" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cf-border">
            {rows.map((row) => {
              const i = row.category - 1;
              const d = data[i];
              return (
                <tr key={row.category} className="align-top">
                  <td className="px-3 py-3 font-medium text-cf-ink">
                    {row.category}. {VULNERABILITY_CATEGORIES[i]}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-semibold text-cf-blue">{row.priorScore}</span>
                    <span className="text-xs text-cf-muted"> / 20</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-semibold text-cf-orange">{row.currentScore}</span>
                    <span className="text-xs text-cf-muted"> / 20</span>
                  </td>
                  <td className="px-3 py-3">
                    <textarea className={`${FIELD} min-h-16`} rows={3} value={d.patch.currentState} onChange={(e) => setField(row.category, "currentState", e.target.value)} aria-label="Current state" />
                  </td>
                  <td className="px-3 py-3">
                    <textarea className={`${FIELD} min-h-16`} rows={3} value={d.patch.desiredState} onChange={(e) => setField(row.category, "desiredState", e.target.value)} aria-label="Desired state" />
                  </td>
                  <td className="px-3 py-3">
                    <textarea className={`${FIELD} min-h-16`} rows={3} value={d.patch.agreedActions} onChange={(e) => setField(row.category, "agreedActions", e.target.value)} aria-label="Agreed actions" />
                  </td>
                  <td className="px-3 py-3">
                    <input className={FIELD} value={d.patch.owner} onChange={(e) => setField(row.category, "owner", e.target.value)} aria-label="Owner" />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className={FIELD}
                      type="date"
                      value={d.patch.targetDate ?? ""}
                      onChange={(e) => setField(row.category, "targetDate", e.target.value || null)}
                      aria-label="Target date"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className={FIELD}
                      value={d.patch.status}
                      onChange={(e) => setField(row.category, "status", e.target.value)}
                      aria-label={`Results and status for ${VULNERABILITY_CATEGORIES[row.category - 1]}`}
                    >
                      <option value="">—</option>
                      {statusOptions(d.patch.status).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-cf-border bg-cf-canvas font-semibold text-cf-ink">
              <td className="px-3 py-3">Total</td>
              <td className="px-3 py-3 text-cf-blue">{priorTotal}</td>
              <td className="px-3 py-3 text-cf-orange">{currentTotal}</td>
              <td colSpan={6} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreCard({ title, total, tone }: { title: string; total: number; tone: "orange" | "muted" }) {
  const pct = pursuitScore(total);
  return (
    <div className={`rounded-xl border p-4 ${tone === "orange" ? "border-cf-orange/50 bg-cf-orange-light/40" : "border-cf-border bg-white"}`}>
      <div className="text-xs font-medium text-cf-muted">{title}</div>
      <div className="mt-1 text-2xl font-bold text-cf-ink">
        {total}
        <span className="text-sm font-medium text-cf-muted"> / 120</span>
      </div>
      <div className={`text-sm font-semibold ${tone === "orange" ? "text-cf-orange" : "text-cf-muted"}`}>
        {fmtPct(pct)}
      </div>
    </div>
  );
}
