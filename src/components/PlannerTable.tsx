"use client";

import { useTransition } from "react";
import { addActionItemAction, deleteActionItemAction, saveActionItemAction } from "@/app/actions";
import type { ActionItem } from "@/src/lib/db";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TIPS } from "@/src/lib/tooltips";
import { InfoTip } from "./InfoTip";
import { SavedIndicator } from "./SavedIndicator";
import { useAutosave } from "./useAutosave";

const FIELD = "w-full rounded-md border border-cf-border bg-white px-2.5 py-2 text-sm focus:border-cf-orange focus:outline-none";

/** Option list for the status select; keeps any pre-existing custom value visible and selectable. */
function statusOptions(value: string): string[] {
  return STATUS_OPTIONS.includes(value) ? STATUS_OPTIONS : [...STATUS_OPTIONS, value];
}

export function PlannerTable({ pursuitId, items }: { pursuitId: string; items: ActionItem[] }) {
  const { data, update, status } = useAutosave(
    (d) =>
      Promise.all(
        d.map((item) =>
          saveActionItemAction(pursuitId, item.id, {
            action: item.action,
            clientContact: item.clientContact,
            dueDate: item.dueDate,
            owner: item.owner,
            priority: item.priority,
            status: item.status,
          }),
        ),
      ).then(() => undefined),
    items.map((item) => ({
      id: item.id,
      action: item.action,
      clientContact: item.clientContact,
      dueDate: item.dueDate,
      owner: item.owner,
      priority: item.priority,
      status: item.status,
    })),
    500,
  );
  const [pending, startTransition] = useTransition();

  const setField = (id: string, key: string, value: string | null) =>
    update((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-cf-ink">Action Planner</h1>
          <p className="text-sm text-cf-muted">Tactical next steps: what, why, how - and who owns them.</p>
        </div>
        <div className="flex items-center gap-3">
          <SavedIndicator status={status} />
          <button
            type="button"
            disabled={pending}
            className="rounded-md bg-cf-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cf-orange-dark disabled:opacity-60"
            onClick={() => startTransition(async () => void (await addActionItemAction(pursuitId)))}
          >
            Add action
          </button>
        </div>
      </div>

      {data.length === 0 && (
        <p className="rounded-xl border border-dashed border-cf-border bg-white px-6 py-4 text-sm text-cf-muted">
          No actions yet for this account. The column guides in the table explain what to record; add your first action to begin.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-cf-border bg-white">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cf-border bg-cf-canvas text-left text-xs font-semibold uppercase tracking-wide text-cf-muted">
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Action <InfoTip tip={TIPS.action} label="action" /></span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Client contact <InfoTip tip={TIPS.clientContact} label="client contact" /></span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Due date <InfoTip tip={TIPS.dueDate} label="due date" /></span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Owner <InfoTip tip={TIPS.plannerOwner} label="owner" /></span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Priority <InfoTip tip={TIPS.priority} label="priority" /></span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">Status <InfoTip tip={TIPS.plannerStatus} label="status" /></span>
                </th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cf-border">
              {data.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-3 py-3">
                    <textarea
                      className={`${FIELD} min-h-16`}
                      rows={3}
                      value={item.action}
                      onChange={(e) => setField(item.id, "action", e.target.value)}
                      aria-label="Action"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input className={FIELD} value={item.clientContact} onChange={(e) => setField(item.id, "clientContact", e.target.value)} aria-label="Client contact" />
                  </td>
                  <td className="px-3 py-3">
                    <input className={FIELD} type="date" value={item.dueDate ?? ""} onChange={(e) => setField(item.id, "dueDate", e.target.value || null)} aria-label="Due date" />
                  </td>
                  <td className="px-3 py-3">
                    <input className={FIELD} value={item.owner} onChange={(e) => setField(item.id, "owner", e.target.value)} aria-label="Owner" />
                  </td>
                  <td className="px-3 py-3">
                    <select className={FIELD} value={item.priority} onChange={(e) => setField(item.id, "priority", e.target.value)} aria-label="Priority">
                      <option value="">—</option>
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select className={FIELD} value={item.status} onChange={(e) => setField(item.id, "status", e.target.value)} aria-label="Status">
                      <option value="">—</option>
                      {statusOptions(item.status).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="rounded-md border border-cf-border px-2.5 py-1.5 text-xs font-medium text-cf-muted hover:border-light-red hover:text-light-red"
                      onClick={() => startTransition(async () => void (await deleteActionItemAction(pursuitId, item.id)))}
                      aria-label="Delete action"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
