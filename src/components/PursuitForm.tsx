"use client";

import { useTransition } from "react";
import { deletePursuitAction, savePursuitAction } from "@/app/actions";
import type { Pursuit } from "@/src/lib/db";
import { fmtDate } from "@/src/lib/format";
import { PHASE_OPTIONS, TIPS } from "@/src/lib/tooltips";
import { InfoTip } from "./InfoTip";
import { SavedIndicator } from "./SavedIndicator";
import { useAutosave } from "./useAutosave";

const FIELD_CLASS =
  "w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none";

export function PursuitForm({ pursuit }: { pursuit: Pursuit }) {
  const { data, update, status } = useAutosave(
    (d) => savePursuitAction(pursuit.id, d as Record<string, string | number | null>),
    {
      accountName: pursuit.accountName,
      parentAccount: pursuit.parentAccount,
      leadSalesperson: pursuit.leadSalesperson,
      salespersonEmail: pursuit.salespersonEmail,
      teamMembers: pursuit.teamMembers,
      phase: pursuit.phase,
      proposedOffering: pursuit.proposedOffering,
      dealSize: pursuit.dealSize,
      closeDate: pursuit.closeDate,
    },
    500,
  );
  const [pending, startTransition] = useTransition();

  const text = (key: keyof typeof data) => ({
    value: (data[key] as string | number | null) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-cf-ink">Account Information</h1>
        <SavedIndicator status={status} />
      </div>

      <div className="grid gap-x-6 gap-y-5 rounded-xl border border-cf-border bg-white p-5 md:grid-cols-2">
        <Field label="Account name">
          <input className={FIELD_CLASS} {...text("accountName")} />
        </Field>
        <Field label="Parent account" tip={TIPS.parentAccount}>
          <input className={FIELD_CLASS} {...text("parentAccount")} />
        </Field>
        <Field label="Lead salesperson">
          <input className={FIELD_CLASS} {...text("leadSalesperson")} />
        </Field>
        <Field label="Salesperson email">
          <input className={FIELD_CLASS} type="email" {...text("salespersonEmail")} />
        </Field>
        <Field label="Team members providing input" tip={TIPS.teamMembers} wide>
          <textarea className={FIELD_CLASS} rows={2} {...text("teamMembers")} />
        </Field>
        <Field label="Phase" tip={TIPS.phase}>
          <input className={FIELD_CLASS} list="phase-options" {...text("phase")} />
          <datalist id="phase-options">
            {PHASE_OPTIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Proposed offering" tip={TIPS.proposedOffering}>
          <input className={FIELD_CLASS} {...text("proposedOffering")} />
        </Field>
        <Field label="Estimated size of deal (AUD)" tip={TIPS.dealSize}>
          <input
            className={FIELD_CLASS}
            type="number"
            min={0}
            step={1000}
            value={data.dealSize ?? ""}
            onChange={(e) =>
              update((prev) => ({ ...prev, dealSize: e.target.value === "" ? null : Number(e.target.value) }))
            }
          />
        </Field>
        <Field label="Estimated close date" tip={TIPS.closeDate}>
          <input
            className={FIELD_CLASS}
            type="date"
            value={data.closeDate ?? ""}
            onChange={(e) => update((prev) => ({ ...prev, closeDate: e.target.value || null }))}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-cf-border bg-white p-5">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-cf-ink">
          Analysis history
          <InfoTip tip={TIPS.analysisHistory} label="analysis history" />
        </h2>
        <p className="mt-1 text-xs text-cf-muted">Dates advance when you start a new analysis in the Qualification or Profile tools.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <DateChip label="Today's analysis date" value={pursuit.analysisDateCurrent} />
          <DateChip label="Our last analysis date" value={pursuit.analysisDateLast} />
          <DateChip label="Our prior analysis date" value={pursuit.analysisDatePrior} />
        </div>
      </div>

      <div className="rounded-xl border border-light-red/40 bg-white p-5">
        <h2 className="text-sm font-semibold text-light-red">Danger zone</h2>
        <p className="mt-1 text-xs text-cf-muted">Deleting removes this account and every analysis permanently.</p>
        <button
          type="button"
          disabled={pending}
          className="mt-3 rounded-md border border-light-red px-4 py-2 text-sm font-semibold text-light-red hover:bg-light-red/10 disabled:opacity-60"
          onClick={() => {
            if (confirm(`Delete account "${pursuit.accountName}" and all its analyses? This cannot be undone.`)) {
              startTransition(async () => void (await deletePursuitAction(pursuit.id)));
            }
          }}
        >
          {pending ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  tip,
  wide,
  children,
}: {
  label: string;
  tip?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${wide ? "md:col-span-2" : ""}`}>
      <span className="flex items-center gap-1.5 font-medium text-cf-ink">
        {label}
        {tip ? <InfoTip tip={tip} label={label} /> : null}
      </span>
      {children}
    </label>
  );
}

function DateChip({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-cf-border bg-cf-canvas px-3 py-2">
      <div className="text-xs text-cf-muted">{label}</div>
      <div className="text-sm font-semibold text-cf-ink">{fmtDate(value)}</div>
    </div>
  );
}
