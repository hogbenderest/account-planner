import "server-only";
import { env } from "cloudflare:workers";
import { requireOwner } from "./auth";
import { shouldRotate } from "./formulas";

/**
 * The ONLY module that talks to D1. Every read and write is scoped by the
 * verified owner email from Access; every value is bound, never concatenated.
 */

export interface Pursuit {
  id: string;
  ownerEmail: string;
  accountName: string;
  parentAccount: string;
  leadSalesperson: string;
  salespersonEmail: string;
  teamMembers: string;
  phase: string;
  proposedOffering: string;
  dealSize: number | null;
  closeDate: string | null;
  analysisDateCurrent: string | null;
  analysisDateLast: string | null;
  analysisDatePrior: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QualSnapshot {
  slot: number;
  analysisDate: string | null;
  shouldScores: (number | null)[] | null;
  shouldEvidence: string[] | null;
  canScores: (number | null)[] | null;
  canEvidence: string[] | null;
}

export interface ProfilerSnapshot {
  slot: number;
  analysisDate: string | null;
  scores: (number | null)[] | null;
  evidence: string[] | null;
}

export interface VulnerabilityAction {
  category: number;
  currentState: string;
  desiredState: string;
  agreedActions: string;
  owner: string;
  targetDate: string | null;
  status: string;
}

export interface ActionItem {
  id: string;
  action: string;
  clientContact: string;
  dueDate: string | null;
  owner: string;
  priority: string;
  status: string;
  sortOrder: number;
}

const db = () => (env as { DB: D1Database }).DB;
const now = () => new Date().toISOString();

function rowToPursuit(r: Record<string, unknown>): Pursuit {
  return {
    id: String(r.id),
    ownerEmail: String(r.owner_email),
    accountName: String(r.account_name ?? ""),
    parentAccount: String(r.parent_account ?? ""),
    leadSalesperson: String(r.lead_salesperson ?? ""),
    salespersonEmail: String(r.salesperson_email ?? ""),
    teamMembers: String(r.team_members ?? ""),
    phase: String(r.phase ?? ""),
    proposedOffering: String(r.proposed_offering ?? ""),
    dealSize: r.deal_size === null || r.deal_size === undefined ? null : Number(r.deal_size),
    closeDate: (r.close_date as string | null) ?? null,
    analysisDateCurrent: (r.analysis_date_current as string | null) ?? null,
    analysisDateLast: (r.analysis_date_last as string | null) ?? null,
    analysisDatePrior: (r.analysis_date_prior as string | null) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

const jsonArr = <T,>(s: string | null | undefined): T[] | null =>
  s === null || s === undefined || s === "" || s === "[]" ? null : (JSON.parse(s) as T[]);

// ---------------- pursuits ----------------

export async function listPursuits(): Promise<Pursuit[]> {
  const { results } = await db()
    .prepare("SELECT * FROM pursuits WHERE owner_email = ? ORDER BY updated_at DESC")
    .bind(await requireOwner())
    .all<Record<string, unknown>>();
  return (results ?? []).map(rowToPursuit);
}

export interface PursuitSummary {
  pursuit: Pursuit;
  qualShould: number;
  qualCan: number;
  profilerTotal: number;
}

/** List page data: current qualifier and profiler totals per pursuit, owner-scoped. */
export async function listPursuitSummaries(): Promise<PursuitSummary[]> {
  const owner = await requireOwner();
  const pursuits = (
    await db()
      .prepare("SELECT * FROM pursuits WHERE owner_email = ? ORDER BY updated_at DESC")
      .bind(owner)
      .all<Record<string, unknown>>()
  ).results.map(rowToPursuit);
  if (pursuits.length === 0) return [];

  const qualRows = (
    await db()
      .prepare(
        `SELECT qs.pursuit_id, qs.should_scores, qs.can_scores FROM qual_snapshots qs
         JOIN pursuits p ON qs.pursuit_id = p.id
         WHERE p.owner_email = ? AND qs.slot = 1`,
      )
      .bind(owner)
      .all<{ pursuit_id: string; should_scores: string; can_scores: string }>()
  ).results;
  const profRows = (
    await db()
      .prepare(
        `SELECT ps.pursuit_id, ps.scores FROM profiler_snapshots ps
         JOIN pursuits p ON ps.pursuit_id = p.id
         WHERE p.owner_email = ? AND ps.slot = 1`,
      )
      .bind(owner)
      .all<{ pursuit_id: string; scores: string }>()
  ).results;

  const sum = (arr: (number | null)[] | null) => (arr ?? []).reduce<number>((a, b) => a + (b ?? 0), 0);
  return pursuits.map((p) => ({
    pursuit: p,
    qualShould: sum(jsonArr<number | null>(qualRows.find((r) => r.pursuit_id === p.id)?.should_scores)),
    qualCan: sum(jsonArr<number | null>(qualRows.find((r) => r.pursuit_id === p.id)?.can_scores)),
    profilerTotal: sum(jsonArr<number | null>(profRows.find((r) => r.pursuit_id === p.id)?.scores)),
  }));
}

export async function getPursuit(id: string): Promise<Pursuit | null> {
  const r = await db()
    .prepare("SELECT * FROM pursuits WHERE id = ? AND owner_email = ?")
    .bind(id, await requireOwner())
    .first<Record<string, unknown>>();
  return r ? rowToPursuit(r) : null;
}

export async function createPursuit(
  fields: Partial<Pick<Pursuit, "accountName" | "parentAccount" | "leadSalesperson" | "phase" | "proposedOffering">>,
): Promise<string> {
  const id = crypto.randomUUID();
  const owner = await requireOwner();
  const t = now();
  const stmts = [
    db().prepare(
      `INSERT INTO pursuits (id, owner_email, account_name, parent_account, lead_salesperson, phase,
         proposed_offering, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      owner,
      fields.accountName ?? "",
      fields.parentAccount ?? "",
      fields.leadSalesperson ?? "",
      fields.phase ?? "",
      fields.proposedOffering ?? "",
      t,
      t,
    ),
  ];
  for (let slot = 1; slot <= 3; slot++) {
    stmts.push(
      db().prepare("INSERT INTO qual_snapshots (id, pursuit_id, slot) VALUES (?, ?, ?)").bind(crypto.randomUUID(), id, slot),
      db().prepare("INSERT INTO profiler_snapshots (id, pursuit_id, slot) VALUES (?, ?, ?)").bind(crypto.randomUUID(), id, slot),
    );
  }
  for (let category = 1; category <= 6; category++) {
    stmts.push(
      db().prepare("INSERT INTO vulnerability_actions (pursuit_id, category) VALUES (?, ?)").bind(id, category),
    );
  }
  await db().batch(stmts);
  return id;
}

export async function deletePursuit(id: string): Promise<void> {
  const r = await db()
    .prepare("DELETE FROM pursuits WHERE id = ? AND owner_email = ?")
    .bind(id, await requireOwner())
    .run();
  if (r.meta.changes === 0) throw new Error("Pursuit not found");
}

const PURSUIT_FIELDS: Record<string, string> = {
  accountName: "account_name",
  parentAccount: "parent_account",
  leadSalesperson: "lead_salesperson",
  salespersonEmail: "salesperson_email",
  teamMembers: "team_members",
  phase: "phase",
  proposedOffering: "proposed_offering",
  dealSize: "deal_size",
  closeDate: "close_date",
};

export async function updatePursuit(id: string, patch: Partial<Pursuit>): Promise<void> {
  const entries = Object.entries(patch).filter(([k]) => k in PURSUIT_FIELDS && patch[k as keyof Pursuit] !== undefined);
  if (entries.length === 0) return;
  const sets = entries.map(([k]) => `${PURSUIT_FIELDS[k]} = ?`).join(", ");
  const values = entries.map(([k, v]) => (k === "dealSize" || k === "closeDate" ? (v === "" ? null : v) : v));
  await db()
    .prepare(`UPDATE pursuits SET ${sets}, updated_at = ? WHERE id = ? AND owner_email = ?`)
    .bind(...(values as unknown[]), now(), id, await requireOwner())
    .run();
}

// ---------------- qualifier snapshots ----------------

function rowToQual(r: Record<string, unknown>): QualSnapshot {
  return {
    slot: Number(r.slot),
    analysisDate: (r.analysis_date as string | null) ?? null,
    shouldScores: jsonArr<number | null>(r.should_scores as string | null),
    shouldEvidence: jsonArr<string>(r.should_evidence as string | null),
    canScores: jsonArr<number | null>(r.can_scores as string | null),
    canEvidence: jsonArr<string>(r.can_evidence as string | null),
  };
}

export async function getQualSnapshots(pursuitId: string): Promise<QualSnapshot[]> {
  await getPursuit(pursuitId); // ownership check
  const { results } = await db()
    .prepare("SELECT * FROM qual_snapshots WHERE pursuit_id = ? ORDER BY slot")
    .bind(pursuitId)
    .all<Record<string, unknown>>();
  return (results ?? []).map(rowToQual);
}

export async function saveQualSnapshot(
  pursuitId: string,
  slot: number,
  data: Pick<QualSnapshot, "analysisDate" | "shouldScores" | "shouldEvidence" | "canScores" | "canEvidence">,
): Promise<void> {
  await getPursuit(pursuitId); // ownership check
  await db()
    .prepare(
      `UPDATE qual_snapshots SET analysis_date = ?, should_scores = ?, should_evidence = ?,
         can_scores = ?, can_evidence = ? WHERE pursuit_id = ? AND slot = ?`,
    )
    .bind(
      data.analysisDate,
      JSON.stringify(data.shouldScores ?? []),
      JSON.stringify(data.shouldEvidence ?? []),
      JSON.stringify(data.canScores ?? []),
      JSON.stringify(data.canEvidence ?? []),
      pursuitId,
      slot,
    )
    .run();
}

/**
 * New Analysis, faithful to the workbook macros:
 * - With an existing current analysis: drop slot 3, slot 2 -> 3, slot 1 -> 2,
 *   fresh empty slot 1 dated today.
 * - With no current analysis (first use of the tool): just date slot 1 today,
 *   do not shift empty history (mirrors the "no existing analysis" macro path).
 * The pursuit-level analysis dates always rotate
 * (prior <- last, last <- current, current <- today).
 */
export async function rotateQual(pursuitId: string): Promise<void> {
  const p = await getPursuit(pursuitId);
  if (!p) throw new Error("Pursuit not found");
  const owner = await requireOwner();
  const today = now().slice(0, 10);
  const current = await db()
    .prepare("SELECT analysis_date, should_scores, can_scores FROM qual_snapshots WHERE pursuit_id = ? AND slot = 1")
    .bind(pursuitId)
    .first<{ analysis_date: string | null; should_scores: string; can_scores: string }>();
  // Only shift history when the current snapshot is a recorded evaluation.
  const hasExisting = shouldRotate(
    current?.analysis_date,
    jsonArr<number | null>(current?.should_scores),
    jsonArr<number | null>(current?.can_scores),
  );
  const stmts: D1PreparedStatement[] = [
    db()
      .prepare(
        `UPDATE pursuits SET analysis_date_prior = ?, analysis_date_last = ?, analysis_date_current = ?, updated_at = ?
         WHERE id = ? AND owner_email = ?`,
      )
      .bind(p.analysisDateLast, p.analysisDateCurrent, today, now(), pursuitId, owner),
  ];
  if (hasExisting) {
    stmts.push(
      db().prepare("DELETE FROM qual_snapshots WHERE pursuit_id = ? AND slot = 3").bind(pursuitId),
      db().prepare("UPDATE qual_snapshots SET slot = 3 WHERE pursuit_id = ? AND slot = 2").bind(pursuitId),
      db().prepare("UPDATE qual_snapshots SET slot = 2 WHERE pursuit_id = ? AND slot = 1").bind(pursuitId),
      db()
        .prepare("INSERT INTO qual_snapshots (id, pursuit_id, slot, analysis_date) VALUES (?, ?, 1, ?)")
        .bind(crypto.randomUUID(), pursuitId, today),
    );
  } else {
    stmts.push(
      db().prepare("UPDATE qual_snapshots SET analysis_date = ? WHERE pursuit_id = ? AND slot = 1").bind(today, pursuitId),
    );
  }
  await db().batch(stmts);
}

// ---------------- profiler snapshots ----------------

function rowToProf(r: Record<string, unknown>): ProfilerSnapshot {
  return {
    slot: Number(r.slot),
    analysisDate: (r.analysis_date as string | null) ?? null,
    scores: jsonArr<number | null>(r.scores as string | null),
    evidence: jsonArr<string>(r.evidence as string | null),
  };
}

export async function getProfilerSnapshots(pursuitId: string): Promise<ProfilerSnapshot[]> {
  await getPursuit(pursuitId);
  const { results } = await db()
    .prepare("SELECT * FROM profiler_snapshots WHERE pursuit_id = ? ORDER BY slot")
    .bind(pursuitId)
    .all<Record<string, unknown>>();
  return (results ?? []).map(rowToProf);
}

export async function saveProfilerSnapshot(
  pursuitId: string,
  slot: number,
  data: Pick<ProfilerSnapshot, "analysisDate" | "scores" | "evidence">,
): Promise<void> {
  await getPursuit(pursuitId);
  await db()
    .prepare(
      "UPDATE profiler_snapshots SET analysis_date = ?, scores = ?, evidence = ? WHERE pursuit_id = ? AND slot = ?",
    )
    .bind(data.analysisDate, JSON.stringify(data.scores ?? []), JSON.stringify(data.evidence ?? []), pursuitId, slot)
    .run();
}

export async function rotateProfiler(pursuitId: string): Promise<void> {
  const p = await getPursuit(pursuitId);
  if (!p) throw new Error("Pursuit not found");
  const owner = await requireOwner();
  const today = now().slice(0, 10);
  const current = await db()
    .prepare("SELECT analysis_date, scores FROM profiler_snapshots WHERE pursuit_id = ? AND slot = 1")
    .bind(pursuitId)
    .first<{ analysis_date: string | null; scores: string }>();
  // Only shift history when the current snapshot is a recorded evaluation.
  const hasExisting = shouldRotate(current?.analysis_date, jsonArr<number | null>(current?.scores));
  const stmts: D1PreparedStatement[] = [
    db()
      .prepare(
        `UPDATE pursuits SET analysis_date_prior = ?, analysis_date_last = ?, analysis_date_current = ?, updated_at = ?
         WHERE id = ? AND owner_email = ?`,
      )
      .bind(p.analysisDateLast, p.analysisDateCurrent, today, now(), pursuitId, owner),
  ];
  if (hasExisting) {
    stmts.push(
      db().prepare("DELETE FROM profiler_snapshots WHERE pursuit_id = ? AND slot = 3").bind(pursuitId),
      db().prepare("UPDATE profiler_snapshots SET slot = 3 WHERE pursuit_id = ? AND slot = 2").bind(pursuitId),
      db().prepare("UPDATE profiler_snapshots SET slot = 2 WHERE pursuit_id = ? AND slot = 1").bind(pursuitId),
      db()
        .prepare("INSERT INTO profiler_snapshots (id, pursuit_id, slot, analysis_date) VALUES (?, ?, 1, ?)")
        .bind(crypto.randomUUID(), pursuitId, today),
    );
  } else {
    stmts.push(
      db().prepare("UPDATE profiler_snapshots SET analysis_date = ? WHERE pursuit_id = ? AND slot = 1").bind(today, pursuitId),
    );
  }
  await db().batch(stmts);
}

// ---------------- vulnerability actions ----------------

export async function getVulnerabilityActions(pursuitId: string): Promise<VulnerabilityAction[]> {
  await getPursuit(pursuitId);
  const { results } = await db()
    .prepare("SELECT * FROM vulnerability_actions WHERE pursuit_id = ? ORDER BY category")
    .bind(pursuitId)
    .all<Record<string, unknown>>();
  return (results ?? []).map((r) => ({
    category: Number(r.category),
    currentState: String(r.current_state ?? ""),
    desiredState: String(r.desired_state ?? ""),
    agreedActions: String(r.agreed_actions ?? ""),
    owner: String(r.owner ?? ""),
    targetDate: (r.target_date as string | null) ?? null,
    status: String(r.status ?? ""),
  }));
}

export async function saveVulnerabilityAction(
  pursuitId: string,
  category: number,
  patch: Partial<Omit<VulnerabilityAction, "category">>,
): Promise<void> {
  await getPursuit(pursuitId);
  const fields: Array<[string, unknown]> = [];
  if (patch.currentState !== undefined) fields.push(["current_state", patch.currentState]);
  if (patch.desiredState !== undefined) fields.push(["desired_state", patch.desiredState]);
  if (patch.agreedActions !== undefined) fields.push(["agreed_actions", patch.agreedActions]);
  if (patch.owner !== undefined) fields.push(["owner", patch.owner]);
  if (patch.targetDate !== undefined) fields.push(["target_date", patch.targetDate]);
  if (patch.status !== undefined) fields.push(["status", patch.status]);
  if (fields.length === 0) return;
  const sets = fields.map(([col]) => `${col} = ?`).join(", ");
  await db()
    .prepare(`UPDATE vulnerability_actions SET ${sets} WHERE pursuit_id = ? AND category = ?`)
    .bind(...fields.map(([, v]) => v), pursuitId, category)
    .run();
}

// ---------------- action planner ----------------

export async function listActionItems(pursuitId: string): Promise<ActionItem[]> {
  await getPursuit(pursuitId);
  const { results } = await db()
    .prepare("SELECT * FROM action_items WHERE pursuit_id = ? ORDER BY sort_order, rowid")
    .bind(pursuitId)
    .all<Record<string, unknown>>();
  return (results ?? []).map((r) => ({
    id: String(r.id),
    action: String(r.action ?? ""),
    clientContact: String(r.client_contact ?? ""),
    dueDate: (r.due_date as string | null) ?? null,
    owner: String(r.owner ?? ""),
    priority: String(r.priority ?? ""),
    status: String(r.status ?? ""),
    sortOrder: Number(r.sort_order),
  }));
}

export async function createActionItem(pursuitId: string): Promise<string> {
  const id = crypto.randomUUID();
  await getPursuit(pursuitId); // ownership check
  const row = await db()
    .prepare("SELECT COUNT(*) AS n FROM action_items WHERE pursuit_id = ?")
    .bind(pursuitId)
    .first<{ n: number }>();
  const n = row?.n ?? 0;
  await db()
    .prepare("INSERT INTO action_items (id, pursuit_id, sort_order) VALUES (?, ?, ?)")
    .bind(id, pursuitId, n)
    .run();
  await touchPursuit(pursuitId);
  return id;
}

export async function updateActionItem(
  pursuitId: string,
  id: string,
  patch: Partial<Omit<ActionItem, "id" | "sortOrder">>,
): Promise<void> {
  await getPursuit(pursuitId);
  const fields: Array<[string, unknown]> = [];
  if (patch.action !== undefined) fields.push(["action", patch.action]);
  if (patch.clientContact !== undefined) fields.push(["client_contact", patch.clientContact]);
  if (patch.dueDate !== undefined) fields.push(["due_date", patch.dueDate]);
  if (patch.owner !== undefined) fields.push(["owner", patch.owner]);
  if (patch.priority !== undefined) fields.push(["priority", patch.priority]);
  if (patch.status !== undefined) fields.push(["status", patch.status]);
  if (fields.length === 0) return;
  const sets = fields.map(([col]) => `${col} = ?`).join(", ");
  await db()
    .prepare(`UPDATE action_items SET ${sets} WHERE id = ? AND pursuit_id = ?`)
    .bind(...fields.map(([, v]) => v), id, pursuitId)
    .run();
}

export async function deleteActionItem(pursuitId: string, id: string): Promise<void> {
  await getPursuit(pursuitId);
  await db().prepare("DELETE FROM action_items WHERE id = ? AND pursuit_id = ?").bind(id, pursuitId).run();
}

async function touchPursuit(pursuitId: string): Promise<void> {
  await db()
    .prepare("UPDATE pursuits SET updated_at = ? WHERE id = ? AND owner_email = ?")
    .bind(now(), pursuitId, await requireOwner())
    .run();
}
